import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import type { CancelledBy, ChangeRequestKind } from "@prisma/client";
import { env } from "../../config/env.js";
import { ensureDailyRoom, mintDailyToken, VideoUnavailable } from "../../lib/daily.js";
import { holdExpiry, releaseExpiredHolds } from "../../lib/hold-sweeper.js";
import { guestCanChange, joinPhase } from "../../lib/join-window.js";
import { isTimeZone } from "../../lib/mail.js";
import { prisma } from "../../lib/prisma.js";
import { hashToken, newOpaqueToken } from "../../lib/session-cookie.js";
import { getStripe } from "../../lib/stripe.js";
import { sealToken } from "../../lib/token-seal.js";
import { sendConfirmationAndReceipt, sendGuestNotice, sendProfessionalRequest } from "./booking-mail.js";

const MAX_HELD_PER_EMAIL = 3;
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export class BookingError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

const bookingSelect = {
  id: true,
  clientId: true,
  professionalId: true,
  slotId: true,
  specialty: true,
  feeCents: true,
  currency: true,
  status: true,
  createdAt: true,
  holdExpiresAt: true,
  sessionCode: true,
  linkState: true,
  cancelledBy: true,
  guestFirstName: true,
  guestLastName: true,
  guestEmail: true,
  guestPhone: true,
  guestNote: true,
  changeRequest: true,
  changeRequestSlotId: true,
  professional: {
    select: {
      id: true,
      slug: true,
      name: true,
      title: true,
      city: true,
      credentials: true,
      bio: true,
      practiceMore: true,
      languages: true,
      specialties: true,
      feeCents: true,
      avatarClass: true,
      initials: true,
      photoUrl: true,
    },
  },
  slot: { select: { startsAt: true, endsAt: true } },
  client: { select: { name: true } },
} satisfies Prisma.BookingSelect;

type BookingRow = Prisma.BookingGetPayload<{ select: typeof bookingSelect }>;

function toPublicBooking(booking: BookingRow) {
  return {
    id: booking.id,
    clientId: booking.clientId,
    clientName: booking.client?.name ?? null,
    professionalId: booking.professionalId,
    professional: booking.professional,
    slotId: booking.slotId,
    specialty: booking.specialty,
    startsAt: booking.slot.startsAt.toISOString(),
    endsAt: booking.slot.endsAt.toISOString(),
    feeCents: booking.feeCents,
    currency: booking.currency,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    holdExpiresAt: booking.holdExpiresAt?.toISOString() ?? null,
    sessionCode: booking.sessionCode,
    linkState: booking.linkState,
    cancelledBy: booking.cancelledBy,
    guestFirstName: booking.guestFirstName,
    guestLastName: booking.guestLastName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    guestNote: booking.guestNote,
    changeRequest: booking.changeRequest,
    changeRequestSlotId: booking.changeRequestSlotId,
    joinPhase: joinPhase(booking.slot.startsAt, booking.slot.endsAt),
  };
}

async function loadBooking(id: string) {
  return prisma.booking.findUnique({ where: { id }, select: bookingSelect });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function newSessionCode() {
  const bytes = randomBytes(4);
  let body = "";
  for (let i = 0; i < 4; i++) body += CROCKFORD[bytes[i]! % 32];
  return `AYZ-${body}`;
}

async function unusedSessionCode() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = newSessionCode();
    const existing = await prisma.booking.findUnique({ where: { sessionCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new BookingError(500, "code_unavailable");
}

export async function createHold(slotId: string, clientId?: string) {
  await releaseExpiredHolds();
  const expires = holdExpiry();

  const booking = await prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findUnique({
      where: { id: slotId },
      include: {
        professional: {
          select: { id: true, status: true, feeCents: true, currency: true, specialties: true },
        },
      },
    });
    if (!slot || slot.professional.status !== "approved") throw new BookingError(404, "not_found");
    if (slot.startsAt.getTime() <= Date.now()) throw new BookingError(409, "slot_unavailable");

    const claimed = await tx.slot.updateMany({
      where: { id: slot.id, status: "open" },
      data: { status: "held", holdExpiresAt: expires },
    });
    if (claimed.count !== 1) throw new BookingError(409, "slot_unavailable");

    const created = await tx.booking.create({
      data: {
        clientId,
        professionalId: slot.professionalId,
        slotId: slot.id,
        specialty: slot.professional.specialties[0] ?? "individual-mental-health",
        feeCents: slot.professional.feeCents,
        currency: slot.professional.currency,
        status: "held",
        holdExpiresAt: expires,
      },
      select: { id: true },
    });
    await tx.slot.update({
      where: { id: slot.id },
      data: { holdBookingId: created.id },
    });
    return created;
  });

  const loaded = await loadBooking(booking.id);
  if (!loaded) throw new BookingError(404, "not_found");
  return toPublicBooking(loaded);
}

export async function updateHoldGuest(
  bookingId: string,
  input: {
    guestFirstName?: string;
    guestLastName?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestNote?: string;
    bookerTimeZone?: string;
  },
  client?: { id: string; name: string; email: string },
) {
  await releaseExpiredHolds();
  const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!existing) throw new BookingError(404, "not_found");
  if (existing.status !== "held" || !existing.holdExpiresAt || existing.holdExpiresAt.getTime() <= Date.now()) {
    throw new BookingError(409, "hold_expired");
  }
  if (existing.clientId && existing.clientId !== client?.id) throw new BookingError(403, "forbidden");

  const emailSource = input.guestEmail ?? (client ? client.email : existing.guestEmail ?? "");
  const email = emailSource ? normalizeEmail(emailSource) : "";
  if (!email || !email.includes("@")) throw new BookingError(400, "email_required");

  const pending = await prisma.booking.count({
    where: {
      guestEmail: email,
      status: "held",
      holdExpiresAt: { gt: new Date() },
      NOT: { id: bookingId },
    },
  });
  if (pending >= MAX_HELD_PER_EMAIL) throw new BookingError(409, "too_many_holds");
  if (input.bookerTimeZone !== undefined && !isTimeZone(input.bookerTimeZone)) {
    throw new BookingError(400, "invalid_timezone");
  }

  const nameParts = client?.name.trim().split(/\s+/) ?? [];
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      ...(client ? { clientId: client.id } : {}),
      guestEmail: email,
      guestFirstName: input.guestFirstName?.trim() || (client ? nameParts[0] : undefined) || undefined,
      guestLastName:
        input.guestLastName !== undefined
          ? input.guestLastName.trim() || null
          : client
            ? nameParts.slice(1).join(" ") || null
            : undefined,
      ...(input.guestPhone !== undefined ? { guestPhone: input.guestPhone.trim() || null } : {}),
      ...(input.guestNote !== undefined ? { guestNote: input.guestNote.trim() || null } : {}),
      ...(input.bookerTimeZone ? { bookerTimeZone: input.bookerTimeZone } : {}),
    },
  });

  const loaded = await loadBooking(bookingId);
  if (!loaded) throw new BookingError(404, "not_found");
  return toPublicBooking(loaded);
}

export async function startCheckout(bookingId: string) {
  await releaseExpiredHolds();
  const stripe = getStripe();
  if (!stripe) throw new BookingError(503, "stripe_unavailable");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { professional: { select: { name: true, slug: true } }, slot: { select: { id: true } } },
  });
  if (!booking) throw new BookingError(404, "not_found");
  if (booking.status !== "held" || !booking.holdExpiresAt || booking.holdExpiresAt.getTime() <= Date.now()) {
    throw new BookingError(409, "hold_expired");
  }
  if (!booking.guestEmail) throw new BookingError(400, "email_required");
  if (booking.feeCents < 50) throw new BookingError(400, "invalid_fee");

  if (booking.checkoutSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(booking.checkoutSessionId);
    if (existing.status === "open" && existing.url) return { url: existing.url };
  }

  const success = `${env.publicWebUrl}/client/booking-confirmation?booking=${encodeURIComponent(booking.id)}`;
  const cancel = `${env.publicWebUrl}/client/payment?pro=${encodeURIComponent(booking.professional.slug)}&slot=${encodeURIComponent(booking.slot.id)}&hold=${encodeURIComponent(booking.id)}`;
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: booking.id,
      customer_email: booking.guestEmail,
      metadata: { bookingId: booking.id },
      success_url: success,
      cancel_url: cancel,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: booking.currency || "usd",
            unit_amount: booking.feeCents,
            product_data: { name: `Session with ${booking.professional.name}` },
          },
        },
      ],
    },
    { idempotencyKey: `checkout-${booking.id}` },
  );
  if (!session.url) throw new BookingError(502, "stripe_unavailable");

  await prisma.booking.updateMany({
    where: { id: booking.id, status: "held" },
    data: { checkoutSessionId: session.id },
  });
  return { url: session.url };
}

export type ConfirmOutcome = "confirmed" | "already" | "rejected" | "missing";

/** Webhook-only. A late payment after the hold expired does not reopen the slot. */
export async function confirmPaidCheckout(input: {
  bookingId: string;
  checkoutSessionId: string;
  paymentIntentId: string | null;
}) {
  await releaseExpiredHolds();
  const sessionCode = await unusedSessionCode();
  const manageToken = newOpaqueToken();
  const manageTokenHash = hashToken(manageToken);
  const manageTokenSeal = sealToken(manageToken);
  const joinTokenHash = hashToken(newOpaqueToken());

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: input.bookingId },
        include: { slot: true },
      });
      if (!booking) return "missing" as const;
      if (booking.status === "upcoming" && booking.checkoutSessionId === input.checkoutSessionId) {
        return "already" as const;
      }
      if (booking.status !== "held") return "rejected" as const;

      const stillHeld =
        booking.slot.status === "held" &&
        booking.slot.holdBookingId === booking.id &&
        booking.holdExpiresAt !== null &&
        booking.holdExpiresAt.getTime() > Date.now();
      if (!stillHeld) {
        await tx.booking.updateMany({
          where: { id: booking.id, status: "held" },
          data: { status: "cancelled", cancelledBy: "system", holdExpiresAt: null },
        });
        return "rejected" as const;
      }

      const updated = await tx.booking.updateMany({
        where: { id: booking.id, status: "held" },
        data: {
          status: "upcoming",
          sessionCode,
          manageTokenHash,
          manageTokenSeal,
          joinTokenHash,
          checkoutSessionId: input.checkoutSessionId,
          paymentIntentId: input.paymentIntentId,
          linkState: "ready",
          holdExpiresAt: null,
        },
      });
      if (updated.count !== 1) return "rejected" as const;

      await tx.slot.updateMany({
        where: { id: booking.slotId, status: "held", holdBookingId: booking.id },
        data: { status: "booked", holdExpiresAt: null, holdBookingId: null },
      });
      return "confirmed" as const;
    });
    if (outcome === "confirmed" || outcome === "already") {
      void sendConfirmationAndReceipt(input.bookingId).catch((error) => {
        console.error("Booking email failed", input.bookingId, error);
      });
    }
    return outcome;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return "rejected" as const;
    }
    throw error;
  }
}

export async function getBooking(id: string) {
  await releaseExpiredHolds();
  const booking = await loadBooking(id);
  if (!booking) return null;
  return toPublicBooking(booking);
}

export async function cancelBooking(id: string, actor: { role: "client" | "professional"; userId: string; professionalId?: string }) {
  await releaseExpiredHolds();
  const booking = await prisma.booking.findUnique({ where: { id }, include: { slot: true } });
  if (!booking) throw new BookingError(404, "not_found");

  const asClient = actor.role === "client" && booking.clientId === actor.userId;
  const asPro = actor.role === "professional" && actor.professionalId === booking.professionalId;
  if (!asClient && !asPro) throw new BookingError(403, "forbidden");
  if (booking.status !== "held" && booking.status !== "upcoming") throw new BookingError(409, "not_cancellable");

  if (asClient && booking.status === "upcoming" && !guestCanChange(booking.slot.startsAt)) {
    return requestChange(booking.id, "cancel", null);
  }

  await applyCancel(booking.id, asClient ? "client" : "professional");
  if (booking.guestEmail) {
    void sendGuestNotice(booking.id, "cancelled").catch((error) => console.error(error));
  }

  const loaded = await loadBooking(id);
  if (!loaded) throw new BookingError(404, "not_found");
  return { booking: toPublicBooking(loaded), pending: false };
}

async function applyCancel(id: string, cancelledBy: CancelledBy) {
  const booking = await prisma.booking.findUnique({ where: { id }, include: { slot: true } });
  if (!booking) throw new BookingError(404, "not_found");
  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "cancelled",
        cancelledBy,
        holdExpiresAt: null,
        changeRequest: null,
        changeRequestSlotId: null,
        changeRequestAt: null,
      },
    });
    const ownsHeld = booking.status === "held" && booking.slot.holdBookingId === booking.id;
    const ownsBooked = booking.status === "upcoming" && booking.slot.status === "booked";
    if (ownsHeld || ownsBooked) {
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: "open", holdExpiresAt: null, holdBookingId: null },
      });
    }
  });

}

async function requestChange(id: string, kind: ChangeRequestKind, slotId: string | null) {
  const existing = await prisma.booking.findUnique({ where: { id }, select: { changeRequest: true } });
  if (!existing) throw new BookingError(404, "not_found");
  if (existing.changeRequest) throw new BookingError(409, "change_pending");
  await prisma.booking.update({
    where: { id },
    data: { changeRequest: kind, changeRequestSlotId: slotId, changeRequestAt: new Date() },
  });
  void sendGuestNotice(id, "request").catch((error) => console.error(error));
  void sendProfessionalRequest(id, kind).catch((error) => console.error(error));
  const loaded = await loadBooking(id);
  if (!loaded) throw new BookingError(404, "not_found");
  return { booking: toPublicBooking(loaded), pending: true as const };
}

export async function findJoinBooking(code: string, email: string) {
  await releaseExpiredHolds();
  const sessionCode = code.trim().toUpperCase().replace(/[\s_]/g, "");
  const normalized = /^[0-9A-HJKMNPQRSTVWXYZ]{4}$/.test(sessionCode) ? `AYZ-${sessionCode}` : sessionCode;
  const guestEmail = normalizeEmail(email);
  if (!normalized || !guestEmail) return null;
  const booking = await prisma.booking.findFirst({
    where: {
      sessionCode: normalized,
      guestEmail,
      status: { in: ["upcoming", "completed", "cancelled"] },
    },
    select: bookingSelect,
  });
  if (!booking) return null;
  return toPublicBooking(booking);
}

export async function listMine(clientId: string) {
  await releaseExpiredHolds();
  const rows = await prisma.booking.findMany({
    where: { clientId, status: { not: "held" } },
    select: bookingSelect,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPublicBooking);
}

export async function listForProfessional(professionalId: string) {
  await releaseExpiredHolds();
  const rows = await prisma.booking.findMany({
    where: { professionalId, status: { not: "held" } },
    select: bookingSelect,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPublicBooking);
}

export function paymentIntentIdOf(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent?.id ?? null;
}

async function bookingByManageToken(token: string) {
  return prisma.booking.findUnique({ where: { manageTokenHash: hashToken(token) }, select: bookingSelect });
}

export async function getManagedBooking(token: string) {
  const booking = await bookingByManageToken(token);
  if (!booking || booking.status === "held") throw new BookingError(404, "not_found");
  const slots =
    booking.status === "upcoming"
      ? await prisma.slot.findMany({
          where: { professionalId: booking.professionalId, status: "open", startsAt: { gt: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 48,
          select: { id: true, startsAt: true, endsAt: true },
        })
      : [];
  return {
    booking: toPublicBooking(booking),
    guestCanChange: guestCanChange(booking.slot.startsAt),
    openSlots: slots.map((slot) => ({
      id: slot.id,
      startsAt: slot.startsAt.toISOString(),
      endsAt: slot.endsAt.toISOString(),
    })),
  };
}

export async function manageCancel(token: string) {
  const booking = await bookingByManageToken(token);
  if (!booking) throw new BookingError(404, "not_found");
  if (booking.status !== "upcoming") throw new BookingError(409, "not_cancellable");
  if (!guestCanChange(booking.slot.startsAt)) return requestChange(booking.id, "cancel", null);
  await applyCancel(booking.id, "guest");
  void sendGuestNotice(booking.id, "cancelled").catch((error) => console.error(error));
  const loaded = await loadBooking(booking.id);
  if (!loaded) throw new BookingError(404, "not_found");
  return { booking: toPublicBooking(loaded), pending: false as const };
}

export async function manageReschedule(token: string, slotId: string) {
  const booking = await bookingByManageToken(token);
  if (!booking) throw new BookingError(404, "not_found");
  if (booking.status !== "upcoming") throw new BookingError(409, "not_cancellable");
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.professionalId !== booking.professionalId || slot.status !== "open" || slot.id === booking.slotId) {
    throw new BookingError(409, "slot_unavailable");
  }
  if (!guestCanChange(booking.slot.startsAt)) return requestChange(booking.id, "reschedule", slotId);
  await applyReschedule(booking.id, slotId);
  void sendGuestNotice(booking.id, "rescheduled").catch((error) => console.error(error));
  const loaded = await loadBooking(booking.id);
  if (!loaded) throw new BookingError(404, "not_found");
  return { booking: toPublicBooking(loaded), pending: false as const };
}

async function applyReschedule(bookingId: string, slotId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.status !== "upcoming") throw new BookingError(409, "not_cancellable");
      const taken = await tx.slot.updateMany({
        where: { id: slotId, status: "open", professionalId: booking.professionalId },
        data: { status: "booked", holdExpiresAt: null, holdBookingId: null },
      });
      if (taken.count !== 1) throw new BookingError(409, "slot_unavailable");
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          slotId,
          changeRequest: null,
          changeRequestSlotId: null,
          changeRequestAt: null,
        },
      });
      await tx.slot.updateMany({
        where: { id: booking.slotId, status: "booked" },
        data: { status: "open", holdExpiresAt: null, holdBookingId: null },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new BookingError(409, "slot_unavailable");
    }
    throw error;
  }
}

export async function decideChange(bookingId: string, professionalId: string, accept: boolean) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, select: bookingSelect });
  if (!booking) throw new BookingError(404, "not_found");
  if (booking.professionalId !== professionalId) throw new BookingError(403, "forbidden");
  if (!booking.changeRequest || booking.status !== "upcoming") throw new BookingError(409, "no_request");
  if (!accept) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { changeRequest: null, changeRequestSlotId: null, changeRequestAt: null },
    });
    const loaded = await loadBooking(bookingId);
    if (!loaded) throw new BookingError(404, "not_found");
    return toPublicBooking(loaded);
  }
  if (booking.changeRequest === "cancel") {
    await applyCancel(bookingId, "professional");
    void sendGuestNotice(bookingId, "cancelled").catch((error) => console.error(error));
  } else {
    if (!booking.changeRequestSlotId) throw new BookingError(409, "slot_unavailable");
    await applyReschedule(bookingId, booking.changeRequestSlotId);
    void sendGuestNotice(bookingId, "rescheduled").catch((error) => console.error(error));
  }
  const loaded = await loadBooking(bookingId);
  if (!loaded) throw new BookingError(404, "not_found");
  return toPublicBooking(loaded);
}

function dailyRoomName(sessionCode: string) {
  return `ayz-${sessionCode.replace(/^AYZ-/i, "").toLowerCase()}`;
}

async function mintRoom(bookingId: string, owner: boolean, userName: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      sessionCode: true,
      dailyRoomName: true,
      dailyRoomUrl: true,
      guestFirstName: true,
      slot: { select: { startsAt: true, endsAt: true } },
    },
  });
  if (!booking?.sessionCode || booking.status !== "upcoming") throw new BookingError(409, "join_closed");
  if (joinPhase(booking.slot.startsAt, booking.slot.endsAt) !== "open") throw new BookingError(409, "join_closed");
  try {
    const room =
      booking.dailyRoomName && booking.dailyRoomUrl
        ? { name: booking.dailyRoomName, url: booking.dailyRoomUrl }
        : await ensureDailyRoom({ name: dailyRoomName(booking.sessionCode), endsAt: booking.slot.endsAt });
    if (!booking.dailyRoomName) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { dailyRoomName: room.name, dailyRoomUrl: room.url, linkState: "ready" },
      });
    }
    const token = await mintDailyToken({
      roomName: room.name,
      endsAt: booking.slot.endsAt,
      owner,
      userName,
    });
    return { token, roomUrl: room.url, expiresAt: booking.slot.endsAt.toISOString() };
  } catch (error) {
    if (error instanceof VideoUnavailable) throw new BookingError(503, "video_unavailable");
    throw error;
  }
}

export async function startGuestVideo(code: string, email: string) {
  const sessionCode = code.trim().toUpperCase().replace(/[\s_]/g, "");
  const normalized = /^[0-9A-HJKMNPQRSTVWXYZ]{4}$/.test(sessionCode) ? `AYZ-${sessionCode}` : sessionCode;
  const booking = await prisma.booking.findFirst({
    where: { sessionCode: normalized, guestEmail: normalizeEmail(email), status: "upcoming" },
    select: { id: true, guestFirstName: true },
  });
  if (!booking) throw new BookingError(404, "not_found");
  return mintRoom(booking.id, false, booking.guestFirstName || "Guest");
}

export async function startProfessionalVideo(bookingId: string, professionalId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, professionalId: true, professional: { select: { name: true } } },
  });
  if (!booking || booking.professionalId !== professionalId) throw new BookingError(403, "forbidden");
  return mintRoom(booking.id, true, booking.professional.name);
}

export async function claimableCount(email: string) {
  return prisma.booking.count({
    where: {
      guestEmail: normalizeEmail(email),
      clientId: null,
      status: { in: ["upcoming", "completed", "cancelled"] },
    },
  });
}

export async function claimGuestBookings(userId: string, email: string) {
  const result = await prisma.booking.updateMany({
    where: {
      guestEmail: normalizeEmail(email),
      clientId: null,
      status: { in: ["upcoming", "completed", "cancelled"] },
    },
    data: { clientId: userId, claimedAt: new Date() },
  });
  return result.count;
}
