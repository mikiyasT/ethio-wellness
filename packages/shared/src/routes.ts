import type { CopyKey } from "./copy";

export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  roleSelection: "/register/role",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  sessionExpired: "/session-expired",
  services: "/services",
  professionals: "/professionals",
  professionalDetail: (slug: string) => `/professionals/${slug}`,
  account: "/account",
  clientHome: "/client",
  clientOnboarding: "/client/onboarding",
  clientOnboardingPreferences: "/client/onboarding/preferences",
  clientBook: "/client/book",
  clientPayment: "/client/payment",
  clientBookingConfirmation: "/client/booking-confirmation",
  clientSessions: "/client/sessions",
  clientSessionDetail: (id: string) => `/client/sessions/${id}`,
  professionalHome: "/professional",
  professionalOnboarding: "/professional/onboarding",
  professionalProfile: "/professional/profile",
  professionalSpecialties: "/professional/specialties",
  professionalAvailability: "/professional/availability",
  professionalBookings: "/professional/bookings",
  professionalPending: "/professional/pending",
} as const;

export const guestNav: { href: string; labelKey: CopyKey }[] = [
  { href: routes.home, labelKey: "nav.home" },
  { href: routes.services, labelKey: "nav.services" },
  { href: routes.professionals, labelKey: "nav.professionals" },
];

export const clientNav: { href: string; labelKey: CopyKey }[] = [
  { href: routes.clientHome, labelKey: "nav.home" },
  { href: routes.services, labelKey: "nav.services" },
  { href: routes.professionals, labelKey: "nav.professionals" },
  { href: routes.clientSessions, labelKey: "nav.mySessions" },
];

export const professionalNav: { href: string; labelKey: CopyKey }[] = [
  { href: routes.professionalHome, labelKey: "nav.home" },
  { href: routes.professionalBookings, labelKey: "nav.bookings" },
  { href: routes.professionalAvailability, labelKey: "nav.availability" },
  { href: routes.professionalProfile, labelKey: "nav.profile" },
];

export const clientSidebar: { href: string; labelKey: CopyKey }[] = [
  { href: routes.clientHome, labelKey: "nav.home" },
  { href: routes.services, labelKey: "nav.services" },
  { href: routes.professionals, labelKey: "nav.professionals" },
  { href: routes.clientSessions, labelKey: "nav.mySessions" },
  { href: routes.account, labelKey: "nav.account" },
];

export const professionalSidebar: { href: string; labelKey: CopyKey }[] = [
  { href: routes.professionalHome, labelKey: "nav.home" },
  { href: routes.professionalBookings, labelKey: "nav.bookings" },
  { href: routes.professionalAvailability, labelKey: "nav.availability" },
  { href: routes.professionalSpecialties, labelKey: "nav.specialties" },
  { href: routes.professionalProfile, labelKey: "nav.profile" },
  { href: routes.account, labelKey: "nav.account" },
];

export const clientMobileNav: { href: string; labelKey: CopyKey }[] = [
  { href: routes.clientHome, labelKey: "nav.home" },
  { href: routes.services, labelKey: "nav.services" },
  { href: routes.professionals, labelKey: "nav.professionals" },
  { href: routes.clientSessions, labelKey: "nav.sessions" },
  { href: routes.account, labelKey: "nav.account" },
];

export const professionalMobileNav: { href: string; labelKey: CopyKey }[] = [
  { href: routes.professionalHome, labelKey: "nav.home" },
  { href: routes.professionalBookings, labelKey: "nav.bookings" },
  { href: routes.professionalAvailability, labelKey: "nav.availability" },
  { href: routes.professionalProfile, labelKey: "nav.profile" },
  { href: routes.account, labelKey: "nav.account" },
];
