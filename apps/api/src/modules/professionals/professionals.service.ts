import type { AboutLang, Professional } from "@prisma/client";
import { bilingualBioErrors, type AboutLang as SharedAboutLang } from "@ethio-wellness/shared/bilingual-bio";
import { isCountryCode, primaryTimeZone } from "@ethio-wellness/shared/countries";
import { categories, languageIds, type CategoryId, type LanguageId } from "../catalog.js";
import { releaseExpiredHolds } from "../../lib/hold-sweeper.js";
import { prisma } from "../../lib/prisma.js";

const ianaTimeZones = new Set(Intl.supportedValuesOf("timeZone"));

export function isIanaTimeZone(value: string) {
  return ianaTimeZones.has(value);
}

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
    country: pro.country,
    timezone: pro.timezone,
    credentials: pro.credentials,
    bio: pro.bio,
    about: pro.bio,
    aboutTranslated: pro.aboutTranslated,
    aboutTranslatedLang: pro.aboutTranslatedLang,
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

function initialsOf(name: string) {
  const letters = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return letters || "?";
}

export async function getMyProfessional(professionalId: string) {
  const pro = await prisma.professional.findUnique({ where: { id: professionalId } });
  if (!pro) return null;
  return toPublicProfessional(pro);
}

export async function updateMyProfessional(
  professionalId: string,
  input: {
    name?: string;
    title?: string;
    city?: string;
    credentials?: string;
    bio?: string;
    about?: string;
    aboutTranslated?: string | null;
    aboutTranslatedLang?: AboutLang | null;
    practiceMore?: string;
    languages?: string[];
    specialties?: string[];
    feeCents?: number;
    country?: string;
    timezone?: string;
  },
) {
  if (input.languages?.some((id) => !allowedLanguages.has(id))) return "invalid_catalog" as const;
  if (input.specialties?.some((id) => !allowedCategories.has(id))) return "invalid_catalog" as const;

  const existing = await prisma.professional.findUnique({ where: { id: professionalId } });
  if (!existing) return "not_found" as const;

  const touchesTranslation = input.aboutTranslated !== undefined || input.aboutTranslatedLang !== undefined;
  const english = (input.about ?? input.bio ?? existing.bio).trim();
  const translated =
    input.aboutTranslated !== undefined ? (input.aboutTranslated ?? "").trim() : (existing.aboutTranslated ?? "");
  const translatedLang =
    input.aboutTranslatedLang !== undefined ? input.aboutTranslatedLang : existing.aboutTranslatedLang;
  const languages = (input.languages ?? existing.languages) as LanguageId[];
  if (touchesTranslation) {
    const [issue] = bilingualBioErrors({
      about: english,
      aboutTranslated: translated,
      aboutTranslatedLang: translatedLang as SharedAboutLang | null,
      languages,
    });
    if (issue) return issue.issue;
  }

  const country = input.country?.trim().toUpperCase();
  if (country !== undefined && !isCountryCode(country)) return "invalid_country" as const;
  if (input.timezone !== undefined && !isIanaTimeZone(input.timezone)) return "invalid_timezone" as const;

  let timezone = input.timezone;
  if (country !== undefined && input.timezone === undefined) {
    const derived = primaryTimeZone(country);
    if (!derived || !isIanaTimeZone(derived)) return "invalid_country" as const;
    timezone = derived;
  }

  const pro = await prisma.professional.update({
    where: { id: professionalId },
    data: {
      ...(input.name !== undefined ? { name: input.name, initials: initialsOf(input.name) } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.credentials !== undefined ? { credentials: input.credentials } : {}),
      ...(input.about !== undefined || input.bio !== undefined ? { bio: english } : {}),
      ...(input.aboutTranslated !== undefined ? { aboutTranslated: translated || null } : {}),
      ...(input.aboutTranslatedLang !== undefined ? { aboutTranslatedLang: translatedLang } : {}),
      ...(input.practiceMore !== undefined ? { practiceMore: input.practiceMore } : {}),
      ...(input.languages !== undefined ? { languages: input.languages } : {}),
      ...(input.specialties !== undefined ? { specialties: input.specialties } : {}),
      ...(input.feeCents !== undefined ? { feeCents: input.feeCents } : {}),
      ...(country !== undefined ? { country } : {}),
      ...(timezone !== undefined ? { timezone } : {}),
    },
  });
  return toPublicProfessional(pro);
}

export async function listOpenAvailability(professionalId: string) {
  await releaseExpiredHolds();
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
