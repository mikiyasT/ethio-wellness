/**
 * Guest booking helpers — Phase 1 pilot.
 * Phase 2: WhatsApp OTP, manage links, Daily.co join.
 */

export const SLOT_HOLD_MINUTES = 10;
export const MAX_PENDING_BOOKINGS_PER_EMAIL = 3;

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Session code: AYZ-XXXX (Crockford base32). */
export function generateSessionCode(): string {
  let body = "";
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < 4; i++) {
    body += CROCKFORD[bytes[i]! % 32];
  }
  return `AYZ-${body}`;
}

export function generateOpaqueToken(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Fast non-crypto hash for pilot token storage (Phase 2: real hash). */
export function hashToken(token: string): string {
  let h = 0;
  for (let i = 0; i < token.length; i++) {
    h = (Math.imul(31, h) + token.charCodeAt(i)) | 0;
  }
  return `h${(h >>> 0).toString(16)}`;
}

export function holdExpiresAt(from = new Date(), minutes = SLOT_HOLD_MINUTES): string {
  return new Date(from.getTime() + minutes * 60_000).toISOString();
}

export function isHoldActive(expiresAt?: string | null, now = new Date()): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > now.getTime();
}

/** Parse slot calendar date + display time into a UTC ISO timestamptz. */
export function slotAtUtc(dateIso: string, timeLabel: string): string {
  const match = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let hours = 12;
  let minutes = 0;
  if (match) {
    hours = Number(match[1]);
    minutes = Number(match[2]);
    const ampm = match[3]!.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }
  // Interpret wall time as Africa/Addis_Ababa (EAT, UTC+3) — provider schedule timezone.
  const utcMs = Date.UTC(
    Number(dateIso.slice(0, 4)),
    Number(dateIso.slice(5, 7)) - 1,
    Number(dateIso.slice(8, 10)),
    hours - 3,
    minutes,
    0,
  );
  return new Date(utcMs).toISOString();
}

export function formatInTimeZone(
  utcIso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  },
): string {
  try {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(new Date(utcIso));
  } catch {
    return new Date(utcIso).toLocaleString();
  }
}

export function formatBookerLocal(utcIso: string): string {
  return formatInTimeZone(utcIso, Intl.DateTimeFormat().resolvedOptions().timeZone);
}

export function formatProviderEat(utcIso: string): string {
  return `${formatInTimeZone(utcIso, "Africa/Addis_Ababa")} EAT`;
}

export function buildIcsCalendar(input: {
  title: string;
  description: string;
  startUtc: string;
  durationMin: number;
  url?: string;
}): string {
  const start = new Date(input.startUtc);
  const end = new Date(start.getTime() + input.durationMin * 60_000);
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const escape = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const uid = `${stamp(start)}-${Math.random().toString(36).slice(2)}@ayzoncare.com`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ayzon//Guest Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(input.title)}`,
    `DESCRIPTION:${escape(input.description)}`,
    input.url ? `URL:${input.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadIcs(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Accept `AYZ-XXXX`, `ayz-xxxx`, or bare `XXXX`. */
export function normalizeSessionCode(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[\s_]/g, "");
  if (/^AYZ-[0-9A-HJKMNPQRSTVWXYZ]{4}$/.test(cleaned)) return cleaned;
  if (/^[0-9A-HJKMNPQRSTVWXYZ]{4}$/.test(cleaned)) return `AYZ-${cleaned}`;
  return cleaned;
}

/** Join opens 15 min before start, closes 30 min after (pilot lobby window). */
export function getJoinWindow(slotAt: string, now = new Date()) {
  const start = new Date(slotAt).getTime();
  const openAt = start - 15 * 60_000;
  const closeAt = start + 30 * 60_000;
  const t = now.getTime();
  if (Number.isNaN(start)) {
    return { canJoin: false as const, phase: "invalid" as const, opensInMs: 0 };
  }
  if (t < openAt) {
    return { canJoin: false as const, phase: "soon" as const, opensInMs: openAt - t };
  }
  if (t > closeAt) {
    return { canJoin: false as const, phase: "ended" as const, opensInMs: 0 };
  }
  return { canJoin: true as const, phase: "open" as const, opensInMs: 0 };
}

export function formatOpensIn(ms: number): string {
  const totalMin = Math.max(1, Math.ceil(ms / 60_000));
  if (totalMin < 60) return `${totalMin} min`;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (mins === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours}h ${mins}m`;
}

export function guestDisplayName(first: string, last?: string | null) {
  return [first.trim(), last?.trim()].filter(Boolean).join(" ");
}

export function guestFirstName(booking: { guestFirstName?: string; guestName?: string }) {
  if (booking.guestFirstName?.trim()) return booking.guestFirstName.trim();
  return booking.guestName?.trim().split(/\s+/)[0] || "Guest";
}
