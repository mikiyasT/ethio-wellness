import { formatDayChip, toIsoDate } from "@/lib/availability-editor";
import type { DbBooking, DbProfessional, DbSlot } from "@/lib/db";
import { formatBookerLocal } from "@/lib/guest-booking";
import { apiBase } from "@/lib/public-api";
import type { CategoryId, LanguageId } from "@ethio-wellness/shared";

type ApiProfessional = {
  id: string;
  slug: string;
  name: string;
  title: string;
  city: string;
  credentials: string;
  bio: string;
  practiceMore: string;
  languages: LanguageId[];
  specialties: CategoryId[];
  feeCents: number;
  avatarClass: string;
  initials: string;
  photoUrl: string | null;
};

export type ApiBooking = {
  id: string;
  clientId: string | null;
  clientName: string | null;
  professionalId: string;
  professional: ApiProfessional;
  slotId: string;
  specialty: CategoryId;
  startsAt: string;
  endsAt: string;
  feeCents: number;
  currency: string;
  status: DbBooking["status"];
  createdAt: string;
  holdExpiresAt: string | null;
  sessionCode: string | null;
  linkState: "ready" | "pending" | null;
  cancelledBy: DbBooking["cancelledBy"] | null;
  guestFirstName: string | null;
  guestLastName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guestNote: string | null;
  changeRequest: "cancel" | "reschedule" | null;
  changeRequestSlotId: string | null;
  joinPhase: "soon" | "open" | "ended" | "invalid";
};

const MESSAGES: Record<string, string> = {
  slot_unavailable: "Someone else is holding this slot — try another time",
  too_many_holds: "Too many open bookings for this email. Please use an existing confirmation or try later.",
  hold_expired: "Your 10-minute hold expired. Please pick the slot again.",
  email_required: "A valid email is required",
  stripe_unavailable: "Card checkout is not available right now.",
  not_found: "Booking not found",
  forbidden: "You cannot change this booking",
  change_pending: "You already have a request waiting for your professional.",
  not_cancellable: "This booking can no longer be changed.",
  join_closed: "Join is open from 15 minutes before the session until it ends.",
  video_unavailable: "Video isn’t available right now. Your booking is still confirmed.",
  rate_limited: "Too many attempts. Wait a few minutes and try again.",
  no_request: "There is no change waiting for a decision.",
};

async function bookingRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const method = init?.method ?? "GET";
  if (response.status === 404 && method === "GET") return null as T;
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    const code = body.error || `API ${response.status}`;
    throw new Error(MESSAGES[code] ?? code);
  }
  return response.json() as Promise<T>;
}

export function toProfessional(pro: ApiProfessional): DbProfessional {
  return {
    id: pro.id,
    userId: "",
    slug: pro.slug,
    name: pro.name,
    title: pro.title,
    city: pro.city,
    credentials: pro.credentials,
    bio: pro.bio,
    practiceMore: pro.practiceMore,
    languages: pro.languages,
    specialties: pro.specialties,
    fee: pro.feeCents / 100,
    avatarClass: pro.avatarClass as DbProfessional["avatarClass"],
    initials: pro.initials,
    photoUrl: pro.photoUrl ?? undefined,
    status: "approved",
  };
}

export function toDbBooking(booking: ApiBooking): DbBooking {
  const clientFirst = booking.clientName?.trim().split(/\s+/)[0];
  return {
    id: booking.id,
    clientId: booking.clientId ?? undefined,
    professionalId: booking.professionalId,
    slotId: booking.slotId,
    specialty: booking.specialty,
    dateLabel: formatBookerLocal(booking.startsAt),
    slotAt: booking.startsAt,
    durationMin: Math.max(
      1,
      Math.round((new Date(booking.endsAt).getTime() - new Date(booking.startsAt).getTime()) / 60_000),
    ),
    fee: booking.feeCents / 100,
    feeCents: booking.feeCents,
    currency: booking.currency.toUpperCase(),
    status: booking.status,
    createdAt: booking.createdAt,
    holdExpiresAt: booking.holdExpiresAt ?? undefined,
    sessionCode: booking.sessionCode ?? "",
    linkState: booking.linkState ?? undefined,
    cancelledBy: booking.cancelledBy ?? undefined,
    guestFirstName: booking.guestFirstName ?? clientFirst,
    guestLastName: booking.guestLastName ?? undefined,
    guestEmail: booking.guestEmail ?? undefined,
    guestPhone: booking.guestPhone ?? undefined,
    guestNote: booking.guestNote ?? undefined,
    endsAt: booking.endsAt,
    changeRequest: booking.changeRequest,
    changeRequestSlotId: booking.changeRequestSlotId,
    joinPhase: booking.joinPhase,
  };
}

export function slotFromBooking(booking: DbBooking): DbSlot {
  const start = new Date(booking.slotAt);
  const dateIso = toIsoDate(start);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(start)
    .replace(/[\u202f\u00a0]/g, " ");
  return {
    id: booking.slotId,
    professionalId: booking.professionalId,
    dateIso,
    dayLabel: formatDayChip(dateIso),
    timeLabel,
    status: booking.status === "held" ? "held" : booking.status === "cancelled" ? "open" : "booked",
  };
}

export async function createHold(slotId: string) {
  const body = await bookingRequest<{ booking: ApiBooking }>("/bookings/holds", {
    method: "POST",
    body: JSON.stringify({ slotId }),
  });
  return toDbBooking(body.booking);
}

export async function updateHold(
  bookingId: string,
  guest: {
    guestFirstName?: string;
    guestLastName?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestNote?: string;
    bookerTimeZone?: string;
  },
) {
  const body = await bookingRequest<{ booking: ApiBooking }>(`/bookings/holds/${encodeURIComponent(bookingId)}`, {
    method: "PATCH",
    body: JSON.stringify(guest),
  });
  return toDbBooking(body.booking);
}

export async function startCheckout(bookingId: string) {
  return bookingRequest<{ url: string }>(`/bookings/holds/${encodeURIComponent(bookingId)}/checkout`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchBooking(id: string) {
  const body = await bookingRequest<{ booking: ApiBooking } | null>(`/bookings/${encodeURIComponent(id)}`);
  if (!body) return null;
  return { booking: toDbBooking(body.booking), professional: toProfessional(body.booking.professional) };
}

export async function fetchJoin(code: string, email: string) {
  const params = new URLSearchParams({ code, email });
  const body = await bookingRequest<{ booking: ApiBooking } | null>(`/bookings/join?${params.toString()}`);
  if (!body) return null;
  return { booking: toDbBooking(body.booking), professional: toProfessional(body.booking.professional) };
}

export async function fetchMyBookings() {
  const body = await bookingRequest<{ bookings: ApiBooking[] }>("/bookings/mine");
  return body.bookings.map((booking) => ({
    booking: toDbBooking(booking),
    professional: toProfessional(booking.professional),
  }));
}

export async function fetchProfessionalBookings() {
  const body = await bookingRequest<{ bookings: ApiBooking[] }>("/bookings/professional");
  return body.bookings.map((booking) => toDbBooking(booking));
}

export async function cancelApiBooking(id: string) {
  const body = await bookingRequest<{ booking: ApiBooking; pending: boolean }>(`/bookings/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return { booking: toDbBooking(body.booking), pending: body.pending };
}

export async function startGuestVideo(code: string, email: string) {
  return bookingRequest<{ token: string; roomUrl: string; expiresAt: string }>("/bookings/join/video", {
    method: "POST",
    body: JSON.stringify({ code, email }),
  });
}

export async function startProfessionalVideo(id: string) {
  return bookingRequest<{ token: string; roomUrl: string; expiresAt: string }>(`/bookings/${encodeURIComponent(id)}/video`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export type ManagedBooking = {
  booking: DbBooking;
  professional: DbProfessional;
  guestCanChange: boolean;
  openSlots: { id: string; startsAt: string; endsAt: string }[];
};

export async function fetchManagedBooking(token: string) {
  const body = await bookingRequest<{
    booking: ApiBooking;
    guestCanChange: boolean;
    openSlots: { id: string; startsAt: string; endsAt: string }[];
  } | null>(`/bookings/manage/${encodeURIComponent(token)}`);
  if (!body) return null;
  return {
    booking: toDbBooking(body.booking),
    professional: toProfessional(body.booking.professional),
    guestCanChange: body.guestCanChange,
    openSlots: body.openSlots,
  } satisfies ManagedBooking;
}

export async function manageCancel(token: string) {
  const body = await bookingRequest<{ booking: ApiBooking; pending: boolean }>(
    `/bookings/manage/${encodeURIComponent(token)}/cancel`,
    { method: "POST", body: JSON.stringify({}) },
  );
  return { booking: toDbBooking(body.booking), pending: body.pending };
}

export async function manageReschedule(token: string, slotId: string) {
  const body = await bookingRequest<{ booking: ApiBooking; pending: boolean }>(
    `/bookings/manage/${encodeURIComponent(token)}/reschedule`,
    { method: "POST", body: JSON.stringify({ slotId }) },
  );
  return { booking: toDbBooking(body.booking), pending: body.pending };
}

export async function decideChange(id: string, accept: boolean) {
  const body = await bookingRequest<{ booking: ApiBooking }>(`/bookings/${encodeURIComponent(id)}/decide`, {
    method: "POST",
    body: JSON.stringify({ accept }),
  });
  return toDbBooking(body.booking);
}

export async function fetchClaimable() {
  const body = await bookingRequest<{ count: number }>("/bookings/claimable");
  return body.count;
}

export async function claimGuestBookings() {
  const body = await bookingRequest<{ claimed: number }>("/bookings/claim", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return body.claimed;
}

export async function pollBooking(id: string, attempts = 12) {
  for (let i = 0; i < attempts; i++) {
    const found = await fetchBooking(id);
    if (!found) return null;
    if (found.booking.status !== "held") return found;
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
  }
  return fetchBooking(id);
}
