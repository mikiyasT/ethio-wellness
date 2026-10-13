/** Video join opens 15 minutes before the start and closes when the session ends. */
export const JOIN_LEAD_MS = 15 * 60 * 1000;
export const CHANGE_LEAD_MS = 24 * 60 * 60 * 1000;

export type JoinPhase = "soon" | "open" | "ended" | "invalid";

export function joinPhase(startsAt: Date, endsAt: Date, now = new Date()): JoinPhase {
  const start = startsAt.getTime();
  const end = endsAt.getTime();
  const t = now.getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "invalid";
  if (t < start - JOIN_LEAD_MS) return "soon";
  if (t > end) return "ended";
  return "open";
}

/** A guest may cancel or reschedule on their own only when the session is more than 24 hours away. */
export function guestCanChange(startsAt: Date, now = new Date()) {
  return startsAt.getTime() - now.getTime() > CHANGE_LEAD_MS;
}
