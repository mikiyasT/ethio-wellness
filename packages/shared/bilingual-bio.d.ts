type LanguageId = "amharic" | "tigrinya" | "afaan-oromoo" | "english";

export type AboutLang = "am" | "om" | "ti";

export const BIO_MIN: number;
export const BIO_MAX: number;

export const ABOUT_LANG_OPTIONS: {
  id: AboutLang;
  label: string;
  chip: string;
  languageId: LanguageId;
  placeholder: string;
}[];

export type BioField = "about" | "aboutTranslated" | "aboutTranslatedLang" | "languages";

export type BioIssue =
  | "about_required"
  | "about_too_short"
  | "about_too_long"
  | "translated_required"
  | "translated_too_short"
  | "translated_too_long"
  | "translated_language_required"
  | "non_english_required"
  | "translated_language_mismatch";

export type BioFieldError = { field: BioField; issue: BioIssue; message: string };

export function aboutLangOption(
  id: AboutLang | "" | null | undefined,
): (typeof ABOUT_LANG_OPTIONS)[number] | null;

export function bioIssueMessage(issue: BioIssue, langLabel?: string): string;

export function bilingualBioErrors(input: {
  about: string;
  aboutTranslated: string;
  aboutTranslatedLang: AboutLang | "" | null;
  languages: LanguageId[];
}): BioFieldError[];
