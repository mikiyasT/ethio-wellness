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
};

const MESSAGES: Record<string, string> = {
  slot_unavailable: "Someone else is holding this slot — try another time",
  too_many_holds: "Too many open bookings for this email. Please use an existing confirmation or try later.",
  hold_expired: "Your 10-minute hold expired. Please pick the slot again.",
  email_required: "A valid email is required",
  stripe_unavailable: "Card checkout is not available right now.",
  not_found: "Booking not found",
  forbidden: "You cannot change this booking",
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
    durationMin: 60,
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
  const body = await bookingRequest<{ booking: ApiBooking }>(`/bookings/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return toDbBooking(body.booking);
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
