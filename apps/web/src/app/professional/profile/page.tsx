"use client";

import {
  LANGUAGES,
  professionals,
  routes,
  type LanguageId,
  type Professional,
} from "@ethio-wellness/shared";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { CITIES, loadProDraft, saveProDraft, type ProDraft } from "@/lib/pro-draft";
import { useLocale } from "@/lib/locale";
import { useEffect, useMemo, useState } from "react";

function draftToPreview(draft: ProDraft): Professional {
  const base = professionals[0];
  return {
    ...base,
    name: draft.name || base.name,
    title: draft.title || base.title,
    city: draft.city || base.city,
    bio: draft.bio || base.bio,
    languages: draft.languages.length ? draft.languages : base.languages,
    specialties: draft.specialties.length ? draft.specialties : base.specialties,
    initials:
      draft.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || base.initials,
    status: "approved",
  };
}

export default function ProfessionalProfilePage() {
  const { t } = useLocale();
  const [draft, setDraft] = useState<ProDraft>(loadProDraft);
  const [baseline, setBaseline] = useState<ProDraft>(loadProDraft);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loaded = loadProDraft();
    setDraft(loaded);
    setBaseline(loaded);
  }, []);

  const preview = useMemo(() => draftToPreview(draft), [draft]);

  function toggleLang(id: LanguageId) {
    setDraft((current) => ({
      ...current,
      languages: current.languages.includes(id)
        ? current.languages.filter((item) => item !== id)
        : [...current.languages, id],
    }));
  }

  function onSave() {
    if (!draft.name.trim() || !draft.title.trim()) {
      setError("Display name and professional title are required.");
      return;
    }
    if (draft.languages.length < 1) {
      setError(t("proOnboard.langRequired"));
      return;
    }
    setError("");
    saveProDraft(draft);
    setBaseline(draft);
    setSaved(true);
  }

  function onDiscard() {
    setDraft(baseline);
    setSaved(false);
    setError("");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-ink">{t("proProfile.title")}</h1>
      <p className="mt-2 text-ink-2">{t("proProfile.note")}</p>
      {saved ? (
        <div className="mt-4">
          <Alert tone="success">{t("proProfile.saved")}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {preview.initials}
          </div>
          <div>
            <p className="text-sm font-medium">{t("proOnboard.photo")}</p>
            <button type="button" className="mt-1 text-sm text-primary hover:underline">
              {t("proOnboard.changePhoto")}
            </button>
          </div>
        </div>
        <TextField
          label={t("proProfile.displayName")}
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <TextField
          label={t("proProfile.titleField")}
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">{t("proProfile.city")}</span>
          <select
            className="w-full min-h-[50px] rounded-[10px] border border-border bg-surface px-4 text-base text-ink"
            value={draft.city}
            onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <TextAreaField
          label={t("proProfile.bio")}
          value={draft.bio}
          onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
        />
        <TextAreaField
          label={t("proProfile.more")}
          value={draft.practiceMore}
          onChange={(event) => setDraft((current) => ({ ...current, practiceMore: event.target.value }))}
        />
        <div>
          <p className="mb-2 text-sm font-medium">{t("detail.languages")}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((language) => (
              <label key={language.id} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.languages.includes(language.id)}
                  onChange={() => toggleLang(language.id)}
                />
                <span className={language.id === "amharic" || language.id === "tigrinya" ? "eth" : undefined}>
                  {language.nativeLabel}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onSave}>{t("proProfile.save")}</Button>
          <Button variant="secondary" onClick={onDiscard}>
            {t("proProfile.discard")}
          </Button>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">{t("proProfile.preview")}</h2>
      <div className="mt-4">
        <ProfessionalCard professional={preview} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={routes.professionalSpecialties} className="text-sm text-primary hover:underline">
          {t("proProfile.specialties")}
        </a>
        <a href={routes.professionalAvailability} className="text-sm text-primary hover:underline">
          {t("proProfile.availability")}
        </a>
      </div>
    </div>
  );
}
