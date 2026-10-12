import { env } from "../../config/env.js";
import { buildIcs } from "../../lib/ics.js";
import { formatWhen, sendMail } from "../../lib/mail.js";
import { prisma } from "../../lib/prisma.js";
import { openToken } from "../../lib/token-seal.js";

const mailSelect = {
  id: true,
  guestEmail: true,
  guestFirstName: true,
  sessionCode: true,
  manageTokenSeal: true,
  bookerTimeZone: true,
  feeCents: true,
  currency: true,
  confirmationSentAt: true,
  receiptSentAt: true,
  professional: { select: { name: true, user: { select: { email: true } } } },
  slot: { select: { startsAt: true, endsAt: true } },
} as const;

function joinUrl(code: string) {
  return `${env.publicWebUrl}/join?code=${encodeURIComponent(code)}`;
}

function manageUrl(token: string) {
  return `${env.publicWebUrl}/b/${token}`;
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

async function loadMail(bookingId: string) {
  return prisma.booking.findUnique({ where: { id: bookingId }, select: mailSelect });
}

/** Confirmation (with calendar file and manage link) and a separate receipt. Safe to call twice. */
export async function sendConfirmationAndReceipt(bookingId: string) {
  const booking = await loadMail(bookingId);
  if (!booking?.guestEmail || !booking.sessionCode || !booking.manageTokenSeal) return;
  const when = formatWhen(booking.slot.startsAt, booking.bookerTimeZone);
  const join = joinUrl(booking.sessionCode);
  let token = "";
  try {
    token = openToken(booking.manageTokenSeal);
  } catch (error) {
    console.error("Could not open manage token for email", bookingId, error);
    return;
  }
  const manage = manageUrl(token);
  const greeting = booking.guestFirstName ? `Selam ${booking.guestFirstName},` : "Selam,";

  if (!booking.confirmationSentAt) {
    const claimed = await prisma.booking.updateMany({
      where: { id: bookingId, confirmationSentAt: null },
      data: { confirmationSentAt: new Date() },
    });
    if (claimed.count === 1) {
      try {
        await sendMail({
          to: booking.guestEmail,
          subject: `Your Ayzon session ${booking.sessionCode}`,
          text: [
            greeting,
            "",
            `Your session with ${booking.professional.name} is confirmed.`,
            `Session code: ${booking.sessionCode}`,
            `When: ${when}`,
            "",
            `Join: ${join}`,
            "The code is already in that link. You will also enter the email you booked with.",
            "",
            `Manage, reschedule, or cancel: ${manage}`,
            "A calendar file is attached.",
          ].join("\n"),
          ics: {
            filename: `${booking.sessionCode}.ics`,
            content: buildIcs({
              uid: `${booking.id}@ayzoncare.com`,
              title: `Ayzon session with ${booking.professional.name}`,
              description: `Session code ${booking.sessionCode}. Join: ${join}`,
              startsAt: booking.slot.startsAt,
              endsAt: booking.slot.endsAt,
              url: join,
            }),
          },
        });
      } catch (error) {
        console.error("Confirmation email failed", bookingId, error);
        await prisma.booking.updateMany({
          where: { id: bookingId },
          data: { confirmationSentAt: null },
        });
      }
    }
  }

  if (!booking.receiptSentAt) {
    const claimed = await prisma.booking.updateMany({
      where: { id: bookingId, receiptSentAt: null },
      data: { receiptSentAt: new Date() },
    });
    if (claimed.count === 1) {
      try {
        await sendMail({
          to: booking.guestEmail,
          subject: `Receipt for ${booking.sessionCode}`,
          text: [
            greeting,
            "",
            `Receipt for your session with ${booking.professional.name}.`,
            `Session code: ${booking.sessionCode}`,
            `When: ${when}`,
            `Paid: ${money(booking.feeCents, booking.currency)}`,
            "",
            `Join: ${join}`,
          ].join("\n"),
        });
      } catch (error) {
        console.error("Receipt email failed", bookingId, error);
        await prisma.booking.updateMany({ where: { id: bookingId }, data: { receiptSentAt: null } });
      }
    }
  }
}

export async function sendReminder(bookingId: string, kind: "24h" | "1h" | "5m") {
  const booking = await loadMail(bookingId);
  if (!booking?.guestEmail || !booking.sessionCode) return false;
  const field = kind === "24h" ? "reminder24hSentAt" : kind === "1h" ? "reminder1hSentAt" : "reminder5mSentAt";
  const claimed = await prisma.booking.updateMany({
    where: { id: bookingId, [field]: null, status: "upcoming" },
    data: { [field]: new Date() },
  });
  if (claimed.count !== 1) return false;
  const when = formatWhen(booking.slot.startsAt, booking.bookerTimeZone);
  const lead = kind === "24h" ? "in 24 hours" : kind === "1h" ? "in 1 hour" : "in 5 minutes";
  try {
    await sendMail({
      to: booking.guestEmail,
      subject: `Ayzon session ${booking.sessionCode} starts ${lead}`,
      text: [
        `Your session with ${booking.professional.name} starts ${lead}.`,
        `When: ${when}`,
        `Session code: ${booking.sessionCode}`,
        "",
        `Join: ${joinUrl(booking.sessionCode)}`,
      ].join("\n"),
    });
    return true;
  } catch (error) {
    console.error("Reminder email failed", bookingId, kind, error);
    await prisma.booking.updateMany({ where: { id: bookingId }, data: { [field]: null } });
    return false;
  }
}

export async function sendGuestNotice(
  bookingId: string,
  kind: "cancelled" | "rescheduled" | "request",
) {
  const booking = await loadMail(bookingId);
  if (!booking?.guestEmail || !booking.sessionCode) return;
  const when = formatWhen(booking.slot.startsAt, booking.bookerTimeZone);
  const subject =
    kind === "cancelled"
      ? `Session ${booking.sessionCode} was cancelled`
      : kind === "rescheduled"
        ? `Session ${booking.sessionCode} was rescheduled`
        : `Request received for ${booking.sessionCode}`;
  const body =
    kind === "cancelled"
      ? `Your session with ${booking.professional.name} on ${when} was cancelled. The session code was ${booking.sessionCode}.`
      : kind === "rescheduled"
        ? `Your session with ${booking.professional.name} is now ${when}. Session code ${booking.sessionCode}.\n\nJoin: ${joinUrl(booking.sessionCode)}`
        : `Your professional will decide this change. The session stays on the calendar as ${when} until they accept it. Session code ${booking.sessionCode}.`;
  try {
    await sendMail({ to: booking.guestEmail, subject, text: body });
  } catch (error) {
    console.error("Guest notice failed", bookingId, kind, error);
  }
}

export async function sendProfessionalRequest(bookingId: string, kind: "cancel" | "reschedule") {
  const booking = await loadMail(bookingId);
  const to = booking?.professional.user.email;
  if (!booking?.sessionCode || !to) return;
  const when = formatWhen(booking.slot.startsAt, "Africa/Addis_Ababa");
  try {
    await sendMail({
      to,
      subject: `A guest asked to ${kind} ${booking.sessionCode}`,
      text: [
        `${booking.guestFirstName || "A guest"} asked to ${kind} the session on ${when} (Addis Ababa time).`,
        "Inside 24 hours, you decide. Open Bookings in Ayzon to accept or decline.",
        `Session code: ${booking.sessionCode}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("Professional request email failed", bookingId, error);
  }
}
