import { db, type DbUser } from "@/lib/db";

/** Pilot demo accounts — no passwords. // TODO: replace with real auth */
export const DEMO_CLIENT = {
  id: "user-test-client",
  name: "Test Client",
  email: "test.client@example.com",
  aliases: ["test client", "testclient", "test.client", "test.client@example.com"],
} as const;

export const DEMO_PROVIDER = {
  id: "user-test-provider",
  name: "Test Provider",
  email: "test.provider@example.com",
  professionalId: "pro-test-provider",
  aliases: ["test provider", "testprovider", "test.provider", "test.provider@example.com"],
} as const;

export function normalizeLoginId(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isDemoLoginId(value: string) {
  const key = normalizeLoginId(value);
  const compact = key.replace(/\s+/g, "");
  const aliases = [...DEMO_CLIENT.aliases, ...DEMO_PROVIDER.aliases];
  return aliases.some((alias) => alias === key || alias.replace(/\s+/g, "") === compact);
}

/**
 * Resolve a demo or seeded user by email / display name.
 * // TODO: replace with real auth — never store passwords here.
 */
export async function mockLoginByIdentifier(identifier: string): Promise<DbUser> {
  await db.ensureDemoAccounts();

  const key = normalizeLoginId(identifier);
  if (!key) throw new Error("Enter a username or email");

  const compact = key.replace(/\s+/g, "");

  const clientHit = DEMO_CLIENT.aliases.some(
    (alias) => alias === key || alias.replace(/\s+/g, "") === compact,
  );
  if (clientHit) {
    const user = await db.users.getById(DEMO_CLIENT.id);
    if (user) return user;
  }

  const providerHit = DEMO_PROVIDER.aliases.some(
    (alias) => alias === key || alias.replace(/\s+/g, "") === compact,
  );
  if (providerHit) {
    const user = await db.users.getById(DEMO_PROVIDER.id);
    if (user) return user;
  }

  const byEmail = await db.users.findByEmail(key);
  if (byEmail) return byEmail;

  const byName = await db.users.findByName(key);
  if (byName) return byName;

  // Unknown → create a client for the pilot
  const local = key.includes("@") ? key.split("@")[0]! : key;
  const name = local
    .split(/[._\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return db.users.create({
    name: name || "Member",
    email: key.includes("@") ? key : `${compact || "member"}@example.com`,
    role: "client",
  });
}

/** @deprecated use mockLoginByIdentifier */
export async function mockLoginByEmail(email: string, nameHint?: string): Promise<DbUser> {
  if (nameHint) {
    const existing = await db.users.findByEmail(email.trim().toLowerCase());
    if (existing) return existing;
    return db.users.create({
      name: nameHint,
      email: email.trim().toLowerCase(),
      role: "client",
    });
  }
  return mockLoginByIdentifier(email);
}
