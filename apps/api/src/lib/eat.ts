import { MIN_LEAD_DAYS } from "@ethio-wellness/shared/lead";

/** East Africa Time is UTC+3 year-round. Hour labels match the provider grid. */

export const EAT = "Africa/Addis_Ababa";
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

export { MIN_LEAD_DAYS };

export const EAT_HOUR_LABELS = [
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

const hourLabels = new Set<string>(EAT_HOUR_LABELS);

export function startsAtFromEat(dateIso: string, timeLabel: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso) || !hourLabels.has(timeLabel)) return null;
  const [year, month, day] = dateIso.split("-").map(Number);
  const probe = new Date(Date.UTC(year!, month! - 1, day!));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month! - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const ampm = match[3];
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return new Date(Date.UTC(year!, month! - 1, day!, hours - 3, minutes, 0));
}

/** Calendar date YYYY-MM-DD in East Africa Time. */
export function eatDateIso(instant: Date): string {
  const shifted = new Date(instant.getTime() + EAT_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(dateIso: string, days: number): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day! + days));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Earliest EAT calendar date a provider may open. Oct 10 → Oct 12. */
export function minOpenDate(now = new Date()): string {
  return addCalendarDays(eatDateIso(now), MIN_LEAD_DAYS);
}
