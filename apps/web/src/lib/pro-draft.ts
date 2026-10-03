import type { CategoryId, LanguageId } from "@ethio-wellness/shared";
import { db, type DbProfessional } from "@/lib/db";

export const CITIES = [
  "Addis Ababa",
  "Mekelle",
  "Adama",
  "Hawassa",
  "Bahir Dar",
  "Diaspora",
] as const;

export interface ProDraft {
  name: string;
  title: string;
  city: string;
  credentials: string;
  bio: string;
  practiceMore: string;
  languages: LanguageId[];
  specialties: CategoryId[];
}

/** Blank defaults — name comes from registration, not Hana. */
export const emptyProDraft = (name = ""): ProDraft => ({
  name,
  title: "",
  city: "Addis Ababa",
  credentials: "",
  bio: "",
  practiceMore: "",
  languages: [],
  specialties: [],
});

export function draftFromProfessional(pro: DbProfessional): ProDraft {
  return {
    name: pro.name,
    title: pro.title,
    city: pro.city || "Addis Ababa",
    credentials: pro.credentials,
    bio: pro.bio,
    practiceMore: pro.practiceMore,
    languages: [...pro.languages],
    specialties: [...pro.specialties],
  };
}

export async function loadProDraftForUser(userId: string, fallbackName = ""): Promise<ProDraft> {
  const pro = await db.professionals.getByUserId(userId);
  if (!pro) return emptyProDraft(fallbackName);
  return draftFromProfessional(pro);
}

export async function saveProDraftForUser(userId: string, draft: ProDraft): Promise<DbProfessional | undefined> {
  const pro = await db.professionals.getByUserId(userId);
  if (!pro) return undefined;
  return db.professionals.update(pro.id, {
    name: draft.name,
    title: draft.title,
    city: draft.city,
    credentials: draft.credentials,
    bio: draft.bio,
    practiceMore: draft.practiceMore,
    languages: draft.languages,
    specialties: draft.specialties,
  });
}
