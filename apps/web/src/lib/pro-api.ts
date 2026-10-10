import type { CategoryId, LanguageId } from "@ethio-wellness/shared";
import { apiBase } from "@/lib/public-api";
import type { ProDraft } from "@/lib/pro-draft";

export type MyProfessional = {
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
  status: "pending" | "approved" | "rejected";
};

export type MySlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "open" | "booked" | "held" | "closed";
};

export class ProRequestError extends Error {
  constructor(
    public code: string,
    public minDate?: string,
  ) {
    super(code);
  }
}

async function proRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string; minDate?: string };
    throw new ProRequestError(body.error || `API ${response.status}`, body.minDate);
  }
  return response.json() as Promise<T>;
}

export async function fetchMyProfessional() {
  const body = await proRequest<{ professional: MyProfessional }>("/professionals/me");
  return body.professional;
}

export function saveMyProfessional(draft: ProDraft) {
  return proRequest<{ professional: MyProfessional }>("/professionals/me", {
    method: "PATCH",
    body: JSON.stringify(draft),
  });
}

export async function fetchMyAvailability() {
  const body = await proRequest<{ slots: MySlot[] }>("/availability/me");
  return body.slots;
}

export async function saveMyAvailability(hours: { date: string; time: string }[]) {
  const body = await proRequest<{ slots: MySlot[] }>("/availability/me", {
    method: "PUT",
    body: JSON.stringify({ hours }),
  });
  return body.slots;
}
