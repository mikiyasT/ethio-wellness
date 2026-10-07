import type { DbSlot } from "@/lib/db";
import { db } from "@/lib/db";

/**
 * Non-overlapping 1-hour counseling windows (full day).
 * Supports Ethiopia ↔ diaspora hours (e.g. late night / early morning).
 */
export const HOUR_SLOTS = [
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
] as const;

export type HourSlot = (typeof HOUR_SLOTS)[number];

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayChip(iso: string): string {
  const date = parseIsoDate(iso);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatMonthTitle(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function dayChipRange(startIso: string, count = 7): string[] {
  return Array.from({ length: count }, (_, i) => addDays(startIso, i));
}

export function slotIdFor(professionalId: string, dateIso: string, timeLabel: string) {
  return `slot-${professionalId}-${dateIso}-${timeLabel.replace(/[\s:]/g, "").toLowerCase()}`;
}

export async function loadSlotsForProfessional(professionalId: string): Promise<DbSlot[]> {
  return db.slots.listForProfessional(professionalId);
}

export async function saveSlotsForProfessional(slots: DbSlot[]): Promise<void> {
  const openOrBooked = slots.filter((slot) => slot.status === "open" || slot.status === "booked");
  await db.slots.upsertMany(openOrBooked);
}

/** Full hour grid for one date, merging saved statuses (default closed). */
export function hoursForDate(dateIso: string, saved: DbSlot[], professionalId: string): DbSlot[] {
  return HOUR_SLOTS.map((timeLabel) => {
    const existing = saved.find(
      (slot) => slot.dateIso === dateIso && slot.timeLabel === timeLabel,
    );
    if (existing) {
      return { ...existing, dayLabel: formatDayChip(dateIso), dateIso };
    }
    return {
      id: slotIdFor(professionalId, dateIso, timeLabel),
      professionalId,
      dateIso,
      dayLabel: formatDayChip(dateIso),
      timeLabel,
      status: "closed" as const,
    };
  });
}

export function upsertLocalSlot(slots: DbSlot[], next: DbSlot): DbSlot[] {
  const idx = slots.findIndex(
    (slot) => slot.dateIso === next.dateIso && slot.timeLabel === next.timeLabel,
  );
  if (idx === -1) return [...slots, next];
  const copy = [...slots];
  copy[idx] = next;
  return copy;
}

export function calendarCells(viewYear: number, viewMonth: number): (string | null)[] {
  const first = new Date(viewYear, viewMonth, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIsoDate(new Date(viewYear, viewMonth, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function hasOpenSlots(daySlots: DbSlot[]) {
  return daySlots.some((slot) => slot.status === "open");
}

export function serializeSlots(slots: DbSlot[]) {
  return JSON.stringify(
    [...slots]
      .map((slot) => ({ date: slot.dateIso, time: slot.timeLabel, status: slot.status }))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
  );
}
