"use client";

import {
  ABOUT_LANG_OPTIONS,
  BIO_MAX,
  aboutLangOption,
  type AboutLang,
} from "@ethio-wellness/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useState } from "react";

type Errors = Partial<Record<"about" | "aboutTranslated" | "aboutTranslatedLang", string>>;

export function BilingualBioFields({
  about,
  aboutTranslated,
  aboutTranslatedLang,
  onChange,
  errors,
}: {
  about: string;
  aboutTranslated: string;
  aboutTranslatedLang: AboutLang | "";
  onChange: (next: { about: string; aboutTranslated: string; aboutTranslatedLang: AboutLang | "" }) => void;
  errors?: Errors;
}) {
  const [pendingLang, setPendingLang] = useState<AboutLang | null>(null);
  const selected = aboutLangOption(aboutTranslatedLang);
  const secondLabel = selected?.label ?? "second language";

  function chooseLanguage(next: AboutLang | "") {
    if (next === aboutTranslatedLang) return;
    if (aboutTranslated.trim() && next !== aboutTranslatedLang) {
      if (next) setPendingLang(next);
      return;
    }
    onChange({ about, aboutTranslated, aboutTranslatedLang: next });
  }

  return (
    <div className="space-y-4">
      <BioArea
        label="Bio (English)"
        name="about"
        placeholder="A few sentences about how you work, in English."
        value={about}
        error={errors?.about}
        onChange={(value) => onChange({ about: value, aboutTranslated, aboutTranslatedLang })}
      />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Second language</span>
        <select
          className={cn(
            "w-full min-h-[50px] rounded-[10px] border bg-surface px-4 text-base text-ink",
            errors?.aboutTranslatedLang ? "border-error" : "border-border",
          )}
          value={aboutTranslatedLang}
          aria-label="Second language"
          onChange={(event) => chooseLanguage(event.target.value as AboutLang | "")}
        >
          <option value="">Select a language</option>
          {ABOUT_LANG_OPTIONS.map((language) => (
            <option key={language.id} value={language.id}>
              {language.label}
            </option>
          ))}
        </select>
        {errors?.aboutTranslatedLang ? <span className="text-sm text-error">{errors.aboutTranslatedLang}</span> : null}
      </label>
      <BioArea
        label={`Bio (${secondLabel})`}
        name="aboutTranslated"
        placeholder={selected?.placeholder ?? "Write the same bio in your second language."}
        value={aboutTranslated}
        error={errors?.aboutTranslated}
        onChange={(value) => onChange({ about, aboutTranslated: value, aboutTranslatedLang })}
      />
      <p className="text-sm text-ink-2">
        Guests will swipe between your English bio and your {secondLabel} bio on your profile.
      </p>
      {pendingLang ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bio-lang-title"
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-lg"
          >
            <h2 id="bio-lang-title" className="text-lg font-semibold text-ink">
              Change second language?
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              The text you wrote is in the previous language. Changing the language clears that bio.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => {
                  onChange({ about, aboutTranslated: "", aboutTranslatedLang: pendingLang });
                  setPendingLang(null);
                }}
              >
                Clear and change
              </Button>
              <Button type="button" variant="secondary" onClick={() => setPendingLang(null)}>
                Keep text
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BioArea({
  label,
  name,
  placeholder,
  value,
  error,
  onChange,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="relative block">
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "w-full min-h-28 rounded-[10px] border bg-surface px-3 pt-3 pb-8 text-base text-ink placeholder:text-ink-3",
            error ? "border-error" : "border-border",
          )}
        />
        <span className={cn("pointer-events-none absolute right-3 bottom-2 text-xs", value.length > BIO_MAX ? "text-error" : "text-ink-3")}>
          {value.length} / {BIO_MAX}
        </span>
      </span>
      {error ? <span className="text-sm text-error">{error}</span> : null}
    </label>
  );
}
