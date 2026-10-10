export type Locale = "en" | "am" | "ti" | "om";

export type UserRole = "guest" | "client" | "professional";

export type CategoryId =
  | "individual-mental-health"
  | "couples-counseling"
  | "family-counseling"
  | "addiction-recovery"
  | "grief-and-loss"
  | "youth-and-students"
  | "faith-informed-counseling"
  | "career-and-life-stress";

export type LanguageId = "amharic" | "tigrinya" | "afaan-oromoo" | "english";

export type SlotStatus = "open" | "booked" | "closed" | "held";

export type BookingStatus = "upcoming" | "past" | "cancelled";

export type SessionLinkState = "ready" | "pending";

export interface Category {
  id: CategoryId;
  emoji: string;
  name: string;
  description: string;
}

export interface Professional {
  id: string;
  slug: string;
  initials: string;
  /** Public path to profile photo, e.g. `/professionals/hana-tesfaye.jpg`. */
  photoUrl?: string;
  avatarClass: `av-${number}`;
  name: string;
  title: string;
  city: string;
  languages: LanguageId[];
  specialties: CategoryId[];
  rating: number;
  reviewCount: number;
  bio: string;
  /** Pilot: new professionals wait for manual approval before practicing. */
  status?: "pending" | "approved";
}

/**
 * Persisted availability. `startsAt` and `endsAt` are UTC instants.
 * Day and clock labels are display-only and are not stored.
 */
export interface SlotInstant {
  id: string;
  professionalId: string;
  startsAt: string;
  endsAt: string;
  status: SlotStatus;
}

export interface AvailabilitySlot {
  id: string;
  professionalId: string;
  dayLabel: string;
  timeLabel: string;
  status: SlotStatus;
  /** ISO date YYYY-MM-DD when known (professional availability editor). */
  date?: string;
  /** UTC ISO-8601 instant when this slot came from the API. */
  startsAt?: string;
  /** UTC ISO-8601 instant when this slot came from the API. */
  endsAt?: string;
}

/**
 * Persisted booking window. Identity and payment fields stay on the API record.
 * The browser formats `startsAt` for the booker and East Africa Time for the provider.
 */
export interface BookingInstant {
  id: string;
  professionalId: string;
  slotId: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus | "held";
  sessionCode?: string | null;
}

export interface Booking {
  id: string;
  professionalId: string;
  clientId: string;
  specialty: CategoryId;
  dateLabel: string;
  status: BookingStatus;
  linkState?: SessionLinkState;
  cancelledBy?: "client" | "professional";
  /** UTC ISO-8601 instant when this booking came from the API. */
  startsAt?: string;
  /** UTC ISO-8601 instant when this booking came from the API. */
  endsAt?: string;
}

export interface Client {
  id: string;
  initials: string;
  name: string;
  preferredLanguage: LanguageId;
}

export const LOCALES: { id: Locale; label: string; name: string; eth?: boolean }[] = [
  { id: "en", label: "EN", name: "English" },
  { id: "am", label: "አማ", name: "አማርኛ", eth: true },
  { id: "ti", label: "ትግርኛ", name: "ትግርኛ", eth: true },
  { id: "om", label: "Afaan Oromoo", name: "Afaan Oromoo" },
];

export const LANGUAGES: { id: LanguageId; label: string; nativeLabel: string }[] = [
  { id: "amharic", label: "Amharic", nativeLabel: "አማርኛ" },
  { id: "tigrinya", label: "Tigrinya", nativeLabel: "ትግርኛ" },
  { id: "afaan-oromoo", label: "Afaan Oromoo", nativeLabel: "Afaan Oromoo" },
  { id: "english", label: "English", nativeLabel: "English" },
];
