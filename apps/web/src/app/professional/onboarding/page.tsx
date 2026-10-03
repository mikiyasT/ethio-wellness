"use client";

import { LANGUAGES, categories, routes, type CategoryId, type LanguageId } from "@ethio-wellness/shared";
import { Chip } from "@/components/ui/chip";
import { Alert } from "@/components/ui/alert";
import { TextAreaField, TextField } from "@/components/ui/field";
import { CITIES, emptyProDraft, loadProDraftForUser, saveProDraftForUser, type ProDraft } from "@/lib/pro-draft";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function ProfessionalOnboardingPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { user, ready } = useSession();
  const [draft, setDraft] = useState<ProDraft>(emptyProDraft());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !user.userId) return;
    void loadProDraftForUser(user.userId, user.name ?? "").then(setDraft);
  }, [ready, user.userId, user.name]);

  function toggleLang(id: LanguageId) {
    setDraft((current) => ({
      ...current,
      languages: current.languages.includes(id)
        ? current.languages.filter((item) => item !== id)
        : [...current.languages, id],
    }));
  }

  function toggleSpec(id: CategoryId) {
    setDraft((current) => ({
      ...current,
      specialties: current.specialties.includes(id)
        ? current.specialties.filter((item) => item !== id)
        : [...current.specialties, id],
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user.userId) return;
    if (draft.languages.length < 1) {
      setError(t("proOnboard.langRequired"));
      return;
    }
    if (draft.specialties.length < 1) {
      setError(t("proOnboard.specRequired"));
      return;
    }
    setError("");
    await saveProDraftForUser(user.userId, draft);
    router.push(`${routes.professionalSpecialties}?from=onboarding`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href={routes.roleSelection} className="text-sm text-primary">
        {t("proOnboard.backRole")}
      </Link>
      <p className="mt-4 text-sm font-medium text-ink-2">
        <span className="text-primary">{t("proOnboard.stepAbout")}</span>
        {" · "}
        {t("proOnboard.stepSpecialties")}
        {" · "}
        {t("proOnboard.stepAvailability")}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-ink">{t("proOnboard.title")}</h1>
      <p className="mt-2 text-ink-2">{t("proOnboard.sub")}</p>
      {error ? (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {draft.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-medium">{t("proOnboard.photo")}</p>
            <button type="button" className="mt-1 text-sm text-primary hover:underline">
              {t("proOnboard.changePhoto")}
            </button>
          </div>
        </div>
        <TextField
          label={t("register.name")}
          name="name"
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <TextField
          label={t("proOnboard.titleField")}
          name="title"
          value={draft.title}
          placeholder="e.g. Clinical Psychologist"
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">{t("proOnboard.city")}</span>
          <select
            className="w-full min-h-[50px] rounded-[10px] border border-border bg-surface px-4 text-base text-ink"
            value={draft.city}
            onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
          >
            <option value="">Select a city</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label={t("proOnboard.credentials")}
          name="credentials"
          value={draft.credentials}
          onChange={(event) => setDraft((current) => ({ ...current, credentials: event.target.value }))}
        />
        <TextAreaField
          label="Bio"
          name="bio"
          placeholder={t("proOnboard.bio")}
          value={draft.bio}
          onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
        />
        <div>
          <p className="mb-2 text-sm font-medium">{t("detail.specialties")}</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={draft.specialties.includes(category.id)}
                onClick={() => toggleSpec(category.id)}
              >
                {category.emoji} {category.name}
              </Chip>
            ))}
          </div>
        </div>
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
        <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-primary font-semibold text-white">
          {t("onboard.continue")}
        </button>
      </form>
    </div>
  );
}
