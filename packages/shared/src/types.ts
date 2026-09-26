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

export type SlotStatus = "open" | "booked";

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
  avatarClass: `av-${number}`;
  name: string;
  title: string;
  city: string;
  languages: LanguageId[];
  specialties: CategoryId[];
  rating: number;
  reviewCount: number;
  nextSlotLabel: string;
  bio: string;
}

export interface AvailabilitySlot {
  id: string;
  professionalId: string;
  dayLabel: string;
  timeLabel: string;
  status: SlotStatus;
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
}

export interface Client {
  id: string;
  initials: string;
  name: string;
  preferredLanguage: LanguageId;
}

export const LOCALES: { id: Locale; label: string; eth?: boolean }[] = [
  { id: "en", label: "EN" },
  { id: "am", label: "አማ", eth: true },
  { id: "ti", label: "ትግርኛ", eth: true },
  { id: "om", label: "Afaan Oromoo" },
];

export const LANGUAGES: { id: LanguageId; label: string; nativeLabel: string }[] = [
  { id: "amharic", label: "Amharic", nativeLabel: "አማርኛ" },
  { id: "tigrinya", label: "Tigrinya", nativeLabel: "ትግርኛ" },
  { id: "afaan-oromoo", label: "Afaan Oromoo", nativeLabel: "Afaan Oromoo" },
  { id: "english", label: "English", nativeLabel: "English" },
];
