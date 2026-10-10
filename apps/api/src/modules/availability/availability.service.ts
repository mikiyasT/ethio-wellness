import { prisma } from "../../lib/prisma.js";
import { startsAtFromEat } from "../../lib/eat.js";

const HOUR_MS = 60 * 60 * 1000;

export class AvailabilityError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

function toSlot(slot: { id: string; startsAt: Date; endsAt: Date; status: string }) {
  return {
    id: slot.id,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    status: slot.status,
  };
}

export async function listMyAvailability(professionalId: string) {
  const slots = await prisma.slot.findMany({
    where: {
      professionalId,
      status: { in: ["open", "booked", "held"] },
    },
    orderBy: { startsAt: "asc" },
    select: { id: true, startsAt: true, endsAt: true, status: true },
  });
  return slots.map(toSlot);
}

/** Replace this professional's open hours. Booked and held rows stay as they are. */
export async function replaceMyOpenHours(
  professionalId: string,
  hours: { date: string; time: string }[],
) {
  const desired = new Map<string, { startsAt: Date; endsAt: Date }>();
  for (const hour of hours) {
    const startsAt = startsAtFromEat(hour.date, hour.time);
    if (!startsAt) throw new AvailabilityError(400, "invalid_hour");
    const key = startsAt.toISOString();
    if (!desired.has(key)) {
      desired.set(key, { startsAt, endsAt: new Date(startsAt.getTime() + HOUR_MS) });
    }
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.slot.findMany({ where: { professionalId } });
    const byStart = new Map(existing.map((slot) => [slot.startsAt.toISOString(), slot]));

    for (const [key, window] of desired) {
      const row = byStart.get(key);
      if (row && (row.status === "booked" || row.status === "held")) continue;
      if (row?.status === "open") continue;
      if (row) {
        await tx.slot.update({
          where: { id: row.id },
          data: { status: "open", endsAt: window.endsAt, holdExpiresAt: null, holdBookingId: null },
        });
        continue;
      }
      await tx.slot.create({
        data: {
          professionalId,
          startsAt: window.startsAt,
          endsAt: window.endsAt,
          status: "open",
        },
      });
    }

    for (const row of existing) {
      if (row.status !== "open") continue;
      if (desired.has(row.startsAt.toISOString())) continue;
      await tx.slot.delete({ where: { id: row.id } });
    }
  });

  return listMyAvailability(professionalId);
}
