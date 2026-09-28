import type { SessionUser } from "@/lib/session";

/**
 * Demo accounts for the UI pilot.
 * // TODO: replace with real auth
 */
export const MOCK_USERS: Record<string, SessionUser> = {
  "hana@example.com": {
    role: "professional",
    email: "hana@example.com",
    name: "Hana Tesfaye",
    professionalStatus: "approved",
  },
  "abel@example.com": {
    role: "client",
    email: "abel@example.com",
    name: "Abel Desta",
  },
};

/** Resolve a mock session from the email the user typed. Defaults to client Abel. */
export function mockSessionForEmail(email: string): SessionUser {
  const key = email.trim().toLowerCase();
  const known = MOCK_USERS[key];
  if (known) return { ...known, email: key };
  return { role: "client", email: key, name: "Abel Desta" };
}
