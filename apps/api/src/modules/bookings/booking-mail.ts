import { env } from "../../config/env.js";
import { buildIcs } from "../../lib/ics.js";
import { formatWhen, sendMail } from "../../lib/mail.js";
import { prisma } from "../../lib/prisma.js";
import { openToken } from "../../lib/token-seal.js";

const mailSelect = {
  id: true,
  guestEmail: true,
  guestFirstName: true,
  guestLastName: true,
  guestPhone: true,
  guestNote: true,
  sessionCode: true,
  manageTokenSeal: true,
  bookerTimeZone: true,
  feeCents: true,
  currency: true,
  confirmationSentAt: true,
  receiptSentAt: true,
  professional: { select: { name: true, timezone: true, user: { select: { email: true } } } },
  slot: { select: { startsAt: true, endsAt: true } },
} as const;

type MailBooking = NonNullable<Awaited<ReturnType<typeof loadMail>>>;

function joinUrl(code: string) {
  return `${env.publicWebUrl}/join?code=${encodeURIComponent(code)}`;
}

function manageUrl(token: string) {
  return `${env.publicWebUrl}/b/${token}`;
}

function providerJoinUrl() {
  return `${env.publicWebUrl}/professional`;
}

function providerManageUrl() {
  return `${env.publicWebUrl}/professional/bookings`;
}

function providerWhen(booking: MailBooking) {
  return formatWhen(booking.slot.startsAt, booking.professional.timezone);
}

function guestDetailLines(booking: MailBooking) {
  const name = [booking.guestFirstName, booking.guestLastName].filter(Boolean).join(" ").trim() || "Guest";
  const lines = [`Guest: ${name}`];
  if (booking.guestEmail) lines.push(`Email: ${booking.guestEmail}`);
  if (booking.guestPhone) lines.push(`Phone: ${booking.guestPhone}`);
  if (booking.guestNote) lines.push(`Note: ${booking.guestNote}`);
  return lines;
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
        await sendProviderNewBooking(booking);
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
        `Join: ${joinUrl(booking.sessionCode)}`,
        "",
        `Your session with ${booking.professional.name} starts ${lead}.`,
        `When: ${when}`,
        `Session code: ${booking.sessionCode}`,
      ].join("\n"),
    });
    await sendProviderReminder(booking, lead);
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
  if (kind === "cancelled" || kind === "rescheduled") {
    try {
      await sendProviderChange(booking, kind);
    } catch (error) {
      console.error("Provider change email failed", bookingId, kind, error);
    }
  }
}

export async function sendProfessionalRequest(bookingId: string, kind: "cancel" | "reschedule") {
  const booking = await loadMail(bookingId);
  const to = booking?.professional.user.email;
  if (!booking?.sessionCode || !to) return;
  const when = providerWhen(booking);
  try {
    await sendMail({
      to,
      audience: "provider",
      subject: `A guest asked to ${kind} ${booking.sessionCode}`,
      text: [
        `${booking.guestFirstName || "A guest"} asked to ${kind} the session on ${when}.`,
        "Inside 24 hours, you decide. Accept or decline from your bookings.",
        `Session code: ${booking.sessionCode}`,
        "",
        `Manage: ${providerManageUrl()}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("Professional request email failed", bookingId, error);
  }
}

async function sendProviderNewBooking(booking: MailBooking) {
  const to = booking.professional.user.email;
  if (!to || !booking.sessionCode) return;
  await sendMail({
    to,
    audience: "provider",
    subject: `New session ${booking.sessionCode}`,
    text: [
      `${booking.guestFirstName || "A guest"} booked a session with you.`,
      "",
      ...guestDetailLines(booking),
      "",
      `When: ${providerWhen(booking)}`,
      `Session code: ${booking.sessionCode}`,
      "",
      `Join: ${providerJoinUrl()}`,
      `Manage: ${providerManageUrl()}`,
    ].join("\n"),
  });
}

async function sendProviderReminder(booking: MailBooking, lead: string) {
  const to = booking.professional.user.email;
  if (!to || !booking.sessionCode) return;
  await sendMail({
    to,
    audience: "provider",
    subject: `Session ${booking.sessionCode} starts ${lead}`,
    text: [
      `Join: ${providerJoinUrl()}`,
      "",
      `${booking.guestFirstName || "A guest"}'s session starts ${lead}.`,
      `When: ${providerWhen(booking)}`,
      `Session code: ${booking.sessionCode}`,
      "",
      `Manage: ${providerManageUrl()}`,
    ].join("\n"),
  });
}

async function sendProviderChange(booking: MailBooking, kind: "cancelled" | "rescheduled") {
  const to = booking.professional.user.email;
  if (!to || !booking.sessionCode) return;
  const guest = booking.guestFirstName || "A guest";
  const when = providerWhen(booking);
  const text =
    kind === "cancelled"
      ? [`The session with ${guest} on ${when} was cancelled.`, `Session code: ${booking.sessionCode}`, "", `Manage: ${providerManageUrl()}`].join("\n")
      : [
          `Join: ${providerJoinUrl()}`,
          "",
          `The session with ${guest} is now ${when}.`,
          `Session code: ${booking.sessionCode}`,
          "",
          `Manage: ${providerManageUrl()}`,
        ].join("\n");
  await sendMail({
    to,
    audience: "provider",
    subject: kind === "cancelled" ? `Session ${booking.sessionCode} was cancelled` : `Session ${booking.sessionCode} was rescheduled`,
    text,
  });
}
