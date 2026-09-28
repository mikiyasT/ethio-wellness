import type { CategoryId, LanguageId } from "@ethio-wellness/shared";

export const PRO_DRAFT_KEY = "ethio-wellness-pro-draft";
export const PRO_AVAIL_KEY = "ethio-wellness-pro-availability";

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

export const CITIES = [
  "Addis Ababa",
  "Mekelle",
  "Adama",
  "Hawassa",
  "Bahir Dar",
  "Diaspora",
] as const;

export const defaultProDraft = (): ProDraft => ({
  name: "Hana Tesfaye",
  title: "Clinical Psychologist",
  city: "Addis Ababa",
  credentials: "",
  bio: "",
  practiceMore: "",
  languages: ["amharic", "english"],
  specialties: ["individual-mental-health"],
});

export function loadProDraft(): ProDraft {
  if (typeof window === "undefined") return defaultProDraft();
  try {
    const raw = window.localStorage.getItem(PRO_DRAFT_KEY);
    if (!raw) return defaultProDraft();
    return { ...defaultProDraft(), ...(JSON.parse(raw) as Partial<ProDraft>) };
  } catch {
    return defaultProDraft();
  }
}

export function saveProDraft(draft: ProDraft) {
  window.localStorage.setItem(PRO_DRAFT_KEY, JSON.stringify(draft));
}
