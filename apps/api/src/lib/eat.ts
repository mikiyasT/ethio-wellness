import { MIN_LEAD_DAYS } from "@ethio-wellness/shared/lead";

/** East Africa Time. The default for Ethiopian professionals; no daylight saving. */
export const EAT = "Africa/Addis_Ababa";

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

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((item) => item.type === type)?.value ?? "";
}

/** Milliseconds the zone is ahead of UTC at this instant. */
function zoneOffsetMs(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  let hour = Number(part(parts, "hour"));
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(
    Number(part(parts, "year")),
    Number(part(parts, "month")) - 1,
    Number(part(parts, "day")),
    hour,
    Number(part(parts, "minute")),
    Number(part(parts, "second")),
  );
  return asUtc - instant.getTime();
}

/** Calendar date YYYY-MM-DD in an IANA timezone. Defaults to East Africa Time. */
export function eatDateIso(instant: Date, timeZone = EAT): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
}

export function addCalendarDays(dateIso: string, days: number): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day! + days));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Earliest calendar date, in `timeZone`, on which a provider may open an hour. */
export function minOpenDate(now = new Date(), timeZone = EAT): string {
  return addCalendarDays(eatDateIso(now, timeZone), MIN_LEAD_DAYS);
}

/** UTC instant for a wall-clock hour in `timeZone`. Defaults to East Africa Time. */
export function startsAtFromEat(dateIso: string, timeLabel: string, timeZone = EAT): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso) || !hourLabels.has(timeLabel)) return null;
  const [year, month, day] = dateIso.split("-").map(Number);
  const probe = new Date(Date.UTC(year!, month! - 1, day!));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month! - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const ampm = match[3];
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  const wallUtc = Date.UTC(year!, month! - 1, day!, hours, minutes, 0);
  let utcMs = wallUtc - zoneOffsetMs(timeZone, new Date(wallUtc));
  utcMs = wallUtc - zoneOffsetMs(timeZone, new Date(utcMs));
  return new Date(utcMs);
}
