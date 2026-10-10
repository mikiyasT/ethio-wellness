import bcrypt from "bcryptjs";
import type { ProfessionalStatus, UserRole } from "@prisma/client";
import { env } from "../../config/env.js";
import { hashToken, newOpaqueToken, readCookie, SESSION_COOKIE } from "../../lib/session-cookie.js";
import { prisma } from "../../lib/prisma.js";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const RESET_MS = 60 * 60 * 1000;

export class AuthError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professionalId?: string;
  professionalStatus?: ProfessionalStatus;
};

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "professional";
}

function initialsOf(name: string) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return letters || "?";
}

function avatarClass(name: string) {
  const n = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `av-${(n % 8) + 1}`;
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let n = 2;
  while (await prisma.professional.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

type UserWithProfessional = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professional: { id: string; status: ProfessionalStatus } | null;
};

export function toPublicUser(user: UserWithProfessional): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.professional
      ? { professionalId: user.professional.id, professionalStatus: user.professional.status }
      : {}),
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AuthError(409, "email_taken");

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: input.role,
      ...(input.role === "professional"
        ? {
            professional: {
              create: {
                slug: await uniqueSlug(name),
                name,
                title: "",
                city: "",
                bio: "",
                languages: [],
                specialties: [],
                feeCents: 2500,
                avatarClass: avatarClass(name),
                initials: initialsOf(name),
                status: "pending",
              },
            },
          }
        : {}),
    },
    include: { professional: { select: { id: true, status: true } } },
  });
  return toPublicUser(user);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { professional: { select: { id: true, status: true } } },
  });
  if (!user) throw new AuthError(401, "invalid_credentials");
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) throw new AuthError(401, "invalid_credentials");
  return toPublicUser(user);
}

export async function createSession(userId: string) {
  const token = newOpaqueToken();
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_MS),
    },
  });
  return token;
}

export async function userForSessionToken(token: string | undefined) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: { include: { professional: { select: { id: true, status: true } } } },
    },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return toPublicUser(session.user);
}

export async function professionalFromCookie(cookieHeader: string | undefined) {
  const user = await userForSessionToken(readCookie(cookieHeader, SESSION_COOKIE));
  if (!user) throw new AuthError(401, "unauthenticated");
  if (user.role !== "professional" || !user.professionalId) throw new AuthError(403, "forbidden");
  return user;
}

export async function deleteSession(token: string | undefined) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return;
  const token = newOpaqueToken();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_MS),
    },
  });
  if (process.env.NODE_ENV !== "production") {
    const url = `${env.publicWebUrl}/reset-password?token=${encodeURIComponent(token)}`;
    console.info(`Password reset link for ${user.email}: ${url}`);
  }
}

export async function resetPassword(token: string, password: string) {
  const row = await prisma.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!row || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    throw new AuthError(400, "invalid_token");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ]);
}
