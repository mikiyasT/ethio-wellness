import { prisma } from "./prisma.js";
import { sendReminder } from "../modules/bookings/booking-mail.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Send the single closest reminder that is due: 24h, 1h, or 5 minutes. */
export async function sendDueReminders(now = new Date()) {
  const horizon = new Date(now.getTime() + DAY_MS);
  const rows = await prisma.booking.findMany({
    where: {
      status: "upcoming",
      slot: { startsAt: { gt: now, lte: horizon } },
      OR: [{ reminder24hSentAt: null }, { reminder1hSentAt: null }, { reminder5mSentAt: null }],
    },
    select: {
      id: true,
      reminder24hSentAt: true,
      reminder1hSentAt: true,
      reminder5mSentAt: true,
      slot: { select: { startsAt: true } },
    },
  });

  let sent = 0;
  for (const row of rows) {
    const start = row.slot.startsAt.getTime();
    const remaining = start - now.getTime();
    if (remaining <= 0) continue;
    let kind: "24h" | "1h" | "5m" | null = null;
    if (remaining <= 5 * 60 * 1000 && !row.reminder5mSentAt) kind = "5m";
    else if (remaining <= 60 * 60 * 1000 && !row.reminder1hSentAt) kind = "1h";
    else if (remaining <= DAY_MS && !row.reminder24hSentAt) kind = "24h";
    if (!kind) continue;
    if (await sendReminder(row.id, kind)) sent += 1;
  }
  return sent;
}

export function startReminderSweeper() {
  const timer = setInterval(() => {
    void sendDueReminders().catch((error) => {
      console.error("Reminder sweeper failed", error);
    });
  }, 60_000);
  timer.unref();
}
