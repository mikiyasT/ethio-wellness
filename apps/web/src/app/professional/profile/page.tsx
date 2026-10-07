"use client";

import { LANGUAGES, routes, type LanguageId, type Professional } from "@ethio-wellness/shared";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { db, toCardProfessional } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { defaultProfessionalStatus } from "@/lib/pro-approval";
import {
  CITIES,
  emptyProDraft,
  loadProDraftForUser,
  saveProDraftForUser,
  type ProDraft,
} from "@/lib/pro-draft";
import { useSession } from "@/lib/session";
import { useEffect, useMemo, useState } from "react";

export default function ProfessionalProfilePage() {
  const { t } = useLocale();
  const { user, ready, refresh } = useSession();
  const [draft, setDraft] = useState<ProDraft>(emptyProDraft());
  const [baseline, setBaseline] = useState<ProDraft>(emptyProDraft());
  const [previewBase, setPreviewBase] = useState<Professional | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !user.userId) return;
    void (async () => {
      const loaded = await loadProDraftForUser(user.userId!, user.name ?? "");
      setDraft(loaded);
      setBaseline(loaded);
      const pro = await db.professionals.getByUserId(user.userId!);
      if (pro) setPreviewBase(toCardProfessional(pro));
    })();
  }, [ready, user.userId, user.name]);

  const preview = useMemo(() => {
    if (!previewBase) {
      return toCardProfessional({
        id: "preview",
        userId: user.userId ?? "",
        slug: "preview",
        name: draft.name || "Your name",
        title: draft.title || "Your title",
        city: draft.city || "City",
        credentials: draft.credentials,
        bio: draft.bio,
        practiceMore: draft.practiceMore,
        languages: draft.languages,
        specialties: draft.specialties,
        fee: 25,
        avatarClass: "av-1",
        initials:
          draft.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?",
        status: defaultProfessionalStatus(),
      });
    }
    return {
      ...previewBase,
      name: draft.name || previewBase.name,
      title: draft.title || previewBase.title,
      city: draft.city || previewBase.city,
      bio: draft.bio || previewBase.bio,
      languages: draft.languages.length ? draft.languages : previewBase.languages,
      specialties: draft.specialties.length ? draft.specialties : previewBase.specialties,
      initials:
        draft.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || previewBase.initials,
    };
  }, [draft, previewBase, user.userId]);

  function toggleLang(id: LanguageId) {
    setDraft((current) => ({
      ...current,
      languages: current.languages.includes(id)
        ? current.languages.filter((item) => item !== id)
        : [...current.languages, id],
    }));
  }

  async function onSave() {
    if (!user.userId) return;
    if (!draft.name.trim() || !draft.title.trim()) {
      setError("Display name and professional title are required.");
      return;
    }
    if (draft.languages.length < 1) {
      setError(t("proOnboard.langRequired"));
      return;
    }
    setError("");
    await saveProDraftForUser(user.userId, draft);
    setBaseline(draft);
    setSaved(true);
    await refresh();
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
          <Avatar
            initials={preview.initials}
            avatarClass={preview.avatarClass}
            photoUrl={preview.photoUrl}
            name={preview.name}
            size="lg"
            shape="rounded"
          />
          <div>
            <p className="text-sm font-medium">{t("proOnboard.photo")}</p>
            <button type="button" className="mt-1 text-sm text-teal-accent hover:underline">
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
          <Button onClick={() => void onSave()}>{t("proProfile.save")}</Button>
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
        <a href={routes.professionalSpecialties} className="text-sm text-teal-accent hover:underline">
          {t("proProfile.specialties")}
        </a>
        <a href={routes.professionalAvailability} className="text-sm text-teal-accent hover:underline">
          {t("proProfile.availability")}
        </a>
      </div>
    </div>
  );
}
