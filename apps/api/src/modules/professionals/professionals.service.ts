import type { Professional } from "@prisma/client";
import { categories, languageIds, type CategoryId, type LanguageId } from "../catalog.js";
import { prisma } from "../../lib/prisma.js";

const allowedLanguages = new Set<string>(languageIds);
const allowedCategories = new Set<string>(categories.map((category) => category.id));

export function parseIdList(value: string | undefined, allowed: Set<string>): string[] | null {
  if (!value?.trim()) return [];
  const ids = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (ids.some((id) => !allowed.has(id))) return null;
  return ids;
}

export function parseLanguageFilter(value: string | undefined) {
  return parseIdList(value, allowedLanguages) as LanguageId[] | null;
}

export function parseSpecialtyFilter(value: string | undefined) {
  return parseIdList(value, allowedCategories) as CategoryId[] | null;
}

export function toPublicProfessional(pro: Professional) {
  return {
    id: pro.id,
    slug: pro.slug,
    name: pro.name,
    title: pro.title,
    city: pro.city,
    credentials: pro.credentials,
    bio: pro.bio,
    practiceMore: pro.practiceMore,
    languages: pro.languages,
    specialties: pro.specialties,
    feeCents: pro.feeCents,
    currency: pro.currency,
    avatarClass: pro.avatarClass,
    initials: pro.initials,
    photoUrl: pro.photoUrl,
    rating: Number(pro.rating),
    reviewCount: pro.reviewCount,
    status: pro.status,
  };
}

export async function listApprovedProfessionals(filters: {
  languages: LanguageId[];
  specialties: CategoryId[];
}) {
  const pros = await prisma.professional.findMany({
    where: {
      status: "approved",
      ...(filters.languages.length > 0 ? { languages: { hasSome: filters.languages } } : {}),
      ...(filters.specialties.length > 0 ? { specialties: { hasSome: filters.specialties } } : {}),
    },
    orderBy: { name: "asc" },
  });
  return pros.map(toPublicProfessional);
}

export async function getApprovedProfessional(slug: string) {
  const pro = await prisma.professional.findUnique({ where: { slug } });
  if (!pro || pro.status !== "approved") return null;
  return toPublicProfessional(pro);
}

export async function listOpenAvailability(professionalId: string) {
  const slots = await prisma.slot.findMany({
    where: {
      professionalId,
      status: "open",
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
    select: { id: true, startsAt: true, endsAt: true, status: true },
  });
  return slots.map((slot) => ({
    id: slot.id,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    status: slot.status,
  }));
}
