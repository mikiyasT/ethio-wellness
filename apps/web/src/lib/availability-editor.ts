import type { AvailabilitySlot, SlotStatus } from "@ethio-wellness/shared";
import { availabilitySlots } from "@ethio-wellness/shared";
import { PRO_AVAIL_KEY } from "@/lib/pro-draft";

/** 1-hour counseling windows professionals can open (local / EAT in the mock). */
export const HOUR_SLOTS = [
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

/** Next N calendar days starting from `startIso` (inclusive). */
export function dayChipRange(startIso: string, count = 7): string[] {
  return Array.from({ length: count }, (_, i) => addDays(startIso, i));
}

function resolveSampleDayLabel(label: string, today: Date): string {
  const lower = label.toLowerCase();
  if (lower === "today") return toIsoDate(today);
  if (lower === "tomorrow") {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return toIsoDate(t);
  }
  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const idx = weekdays.findIndex((day) => lower.startsWith(day));
  if (idx >= 0) {
    const result = new Date(today);
    const delta = (idx - result.getDay() + 7) % 7 || 7;
    result.setDate(result.getDate() + delta);
    return toIsoDate(result);
  }
  return toIsoDate(today);
}

/** Seed editor state from sample Hana slots + any saved localStorage draft. */
export function loadAvailabilityDraft(professionalId = "pro-hana-tesfaye"): AvailabilitySlot[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const base = availabilitySlots
    .filter((slot) => slot.professionalId === professionalId)
    .map((slot) => {
      const date = slot.date ?? resolveSampleDayLabel(slot.dayLabel, today);
      return {
        ...slot,
        date,
        dayLabel: formatDayChip(date),
      };
    });

  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(PRO_AVAIL_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as AvailabilitySlot[];
    return parsed.map((slot) => {
      const date = slot.date ?? resolveSampleDayLabel(slot.dayLabel, today);
      return { ...slot, date, dayLabel: formatDayChip(date) };
    });
  } catch {
    return base;
  }
}

export function saveAvailabilityDraft(slots: AvailabilitySlot[]) {
  window.localStorage.setItem(PRO_AVAIL_KEY, JSON.stringify(slots));
}

export function slotIdFor(dateIso: string, timeLabel: string) {
  return `slot-${dateIso}-${timeLabel.replace(/[\s:]/g, "").toLowerCase()}`;
}

/** Full hour grid for one date, merging saved statuses (default closed). */
export function hoursForDate(
  dateIso: string,
  saved: AvailabilitySlot[],
  professionalId: string,
): AvailabilitySlot[] {
  return HOUR_SLOTS.map((timeLabel) => {
    const existing = saved.find(
      (slot) => slot.date === dateIso && slot.timeLabel === timeLabel,
    );
    if (existing) {
      return { ...existing, dayLabel: formatDayChip(dateIso), date: dateIso };
    }
    return {
      id: slotIdFor(dateIso, timeLabel),
      professionalId,
      date: dateIso,
      dayLabel: formatDayChip(dateIso),
      timeLabel,
      status: "closed" as SlotStatus,
    };
  });
}

export function upsertSlot(slots: AvailabilitySlot[], next: AvailabilitySlot): AvailabilitySlot[] {
  const idx = slots.findIndex(
    (slot) => slot.date === next.date && slot.timeLabel === next.timeLabel,
  );
  if (idx === -1) return [...slots, next];
  const copy = [...slots];
  copy[idx] = next;
  return copy;
}

/** Days in a month grid (null = padding cell outside month). */
export function calendarCells(viewYear: number, viewMonth: number): (string | null)[] {
  const first = new Date(viewYear, viewMonth, 1);
  const startPad = first.getDay(); // Sun=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIsoDate(new Date(viewYear, viewMonth, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function hasOpenSlots(daySlots: AvailabilitySlot[]) {
  return daySlots.some((slot) => slot.status === "open");
}

export function serializeSlots(slots: AvailabilitySlot[]) {
  return JSON.stringify(
    [...slots]
      .map((slot) => ({ date: slot.date, time: slot.timeLabel, status: slot.status }))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
  );
}
