import type { CategoryId, LanguageId } from "@ethio-wellness/shared";
import { formatDayChip, toIsoDate } from "@/lib/availability-editor";
import type { DbProfessional, DbSlot } from "@/lib/db";

const CONFIGURED_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** On a phone, localhost is the phone. Use the same host that served the page, on the API port. */
function apiBase() {
  if (typeof window === "undefined") return CONFIGURED_API_URL;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return CONFIGURED_API_URL;
  let port = "4000";
  try {
    port = new URL(CONFIGURED_API_URL).port || "4000";
  } catch {
    port = "4000";
  }
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${host}:${port}`;
}

/** Public reads (directory, profile, open hours) come from the API when this is true. Writes stay in localStorage. */
export function usePublicApi() {
  return process.env.NEXT_PUBLIC_USE_API === "true";
}

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
  rating: number;
  reviewCount: number;
  status: "approved";
};

type ApiSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "open";
};

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (response.status === 404) {
    throw new ApiNotFoundError();
  }
  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export class ApiNotFoundError extends Error {
  constructor() {
    super("not_found");
  }
}

function toDbProfessional(pro: ApiProfessional): DbProfessional {
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
    rating: pro.rating,
    reviewCount: pro.reviewCount,
  };
}

/** Booker's local date and hour label. The API value stays a UTC instant. */
export function slotFromInstant(slot: ApiSlot, professionalId: string): DbSlot {
  const start = new Date(slot.startsAt);
  const dateIso = toIsoDate(start);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(start)
    .replace(/[\u202f\u00a0]/g, " ");
  return {
    id: slot.id,
    professionalId,
    dateIso,
    dayLabel: formatDayChip(dateIso),
    timeLabel,
    status: "open",
  };
}

export async function fetchApprovedProfessionals(filters?: {
  languages?: LanguageId[];
  specialties?: CategoryId[];
}) {
  const params = new URLSearchParams();
  if (filters?.languages?.length) params.set("language", filters.languages.join(","));
  if (filters?.specialties?.length) params.set("specialty", filters.specialties.join(","));
  const query = params.toString();
  const body = await apiGet<{ professionals: ApiProfessional[] }>(
    `/professionals${query ? `?${query}` : ""}`,
  );
  return body.professionals.map(toDbProfessional);
}

export async function fetchProfessionalBySlug(slug: string) {
  try {
    const body = await apiGet<{ professional: ApiProfessional }>(`/professionals/${encodeURIComponent(slug)}`);
    return toDbProfessional(body.professional);
  } catch (error) {
    if (error instanceof ApiNotFoundError) return null;
    throw error;
  }
}

export async function fetchOpenSlots(slug: string, professionalId: string) {
  const body = await apiGet<{ slots: ApiSlot[] }>(
    `/professionals/${encodeURIComponent(slug)}/availability`,
  );
  return body.slots.map((slot) => slotFromInstant(slot, professionalId));
}
