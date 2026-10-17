/** Second-bio rules shared by the API and the website. English stays in the existing bio field. */

export const BIO_MIN = 50;
export const BIO_MAX = 1000;

export const ABOUT_LANG_OPTIONS = [
  {
    id: "am",
    label: "Amharic",
    chip: "አማርኛ",
    languageId: "amharic",
    placeholder: "ስለ ሥራዎ ጥቂት ሐሳቦች በአማርኛ ይጻፉ።",
  },
  {
    id: "om",
    label: "Afaan Oromo",
    chip: "Afaan Oromo",
    languageId: "afaan-oromoo",
    placeholder: "Waa'ee hojii keessanii yaada gabaabaa Afaan Oromootiin barreessaa.",
  },
  {
    id: "ti",
    label: "Tigrinya",
    chip: "ትግርኛ",
    languageId: "tigrinya",
    placeholder: "ብዛዕባ ስራሕኩም ሓጺር መግለጺ ብትግርኛ ጽሓፉ።",
  },
];

const NON_ENGLISH = new Set(["amharic", "tigrinya", "afaan-oromoo"]);

export function aboutLangOption(id) {
  return ABOUT_LANG_OPTIONS.find((item) => item.id === id) ?? null;
}

export function bioIssueMessage(issue) {
  switch (issue) {
    case "about_required":
    case "translated_required":
      return "This bio is required.";
    case "about_too_short":
    case "translated_too_short":
      return "Write at least 50 characters.";
    case "about_too_long":
    case "translated_too_long":
      return "Keep this bio to 1,000 characters.";
    case "translated_language_required":
      return "Choose a second language.";
    case "non_english_required":
      return "Check at least one language besides English.";
    case "translated_language_mismatch":
      return "Your second bio language must be one of the languages you offer.";
    default:
      return "second language";
  }
}

function lengthIssue(value, field) {
  const text = value.trim();
  if (!text) return field === "about" ? "about_required" : "translated_required";
  if (text.length < BIO_MIN) return field === "about" ? "about_too_short" : "translated_too_short";
  if (text.length > BIO_MAX) return field === "about" ? "about_too_long" : "translated_too_long";
  return null;
}

/** Submit-time checks for the two bios and the languages the provider offers. */
export function bilingualBioErrors(input) {
  const errors = [];
  const aboutIssue = lengthIssue(input.about, "about");
  if (aboutIssue) errors.push({ field: "about", issue: aboutIssue, message: bioIssueMessage(aboutIssue) });
  const translatedIssue = lengthIssue(input.aboutTranslated, "aboutTranslated");
  if (translatedIssue) {
    errors.push({ field: "aboutTranslated", issue: translatedIssue, message: bioIssueMessage(translatedIssue) });
  }
  const lang = input.aboutTranslatedLang || "";
  const option = aboutLangOption(lang);
  if (!option) {
    errors.push({
      field: "aboutTranslatedLang",
      issue: "translated_language_required",
      message: bioIssueMessage("translated_language_required"),
    });
  }
  const offersNonEnglish = input.languages.some((id) => NON_ENGLISH.has(id));
  if (!offersNonEnglish) {
    errors.push({
      field: "languages",
      issue: "non_english_required",
      message: bioIssueMessage("non_english_required"),
    });
  } else if (option && !input.languages.includes(option.languageId)) {
    errors.push({
      field: "aboutTranslatedLang",
      issue: "translated_language_mismatch",
      message: bioIssueMessage("translated_language_mismatch"),
    });
  }
  return errors;
}
