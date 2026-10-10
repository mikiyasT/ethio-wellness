import { prisma } from "./prisma.js";

const HOLD_MS = 10 * 60 * 1000;

export function holdExpiry(from = new Date()) {
  return new Date(from.getTime() + HOLD_MS);
}

/** Reopen slots whose 10-minute hold has lapsed. Booking becomes cancelled, never upcoming. */
export async function releaseExpiredHolds(now = new Date()) {
  const expired = await prisma.booking.findMany({
    where: { status: "held", holdExpiresAt: { lt: now } },
    select: { id: true, slotId: true },
  });
  if (expired.length === 0) return 0;

  await prisma.$transaction(async (tx) => {
    for (const booking of expired) {
      await tx.slot.updateMany({
        where: { id: booking.slotId, status: "held", holdBookingId: booking.id },
        data: { status: "open", holdExpiresAt: null, holdBookingId: null },
      });
      await tx.booking.updateMany({
        where: { id: booking.id, status: "held" },
        data: { status: "cancelled", cancelledBy: "system", holdExpiresAt: null },
      });
    }
  });
  return expired.length;
}

export function startHoldSweeper() {
  const timer = setInterval(() => {
    void releaseExpiredHolds().catch((error) => {
      console.error("Hold sweeper failed", error);
    });
  }, 30_000);
  timer.unref();
}
