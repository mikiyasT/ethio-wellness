"use client";

import { categories, routes, type CategoryId } from "@ethio-wellness/shared";
import { Chip } from "@/components/ui/chip";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { loadProDraft, saveProDraft } from "@/lib/pro-draft";
import { useLocale } from "@/lib/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function SpecialtiesInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const fromOnboarding = search.get("from") === "onboarding";
  const [selected, setSelected] = useState<CategoryId[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = loadProDraft();
    setSelected(draft.specialties);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(q) || category.description.toLowerCase().includes(q),
    );
  }, [query]);

  function save() {
    if (selected.length < 1) {
      setError(t("proSpecs.required"));
      return;
    }
    setError("");
    const draft = loadProDraft();
    saveProDraft({ ...draft, specialties: selected });
    if (fromOnboarding) {
      router.push(`${routes.professionalAvailability}?from=onboarding`);
      return;
    }
    router.push(routes.professionalHome);
  }

  return (
    <div className="mx-auto max-w-xl">
      {fromOnboarding ? (
        <p className="text-sm font-medium text-ink-2">
          {t("proOnboard.stepAbout")}
          {" · "}
          <span className="text-primary">{t("proOnboard.stepSpecialties")}</span>
          {" · "}
          {t("proOnboard.stepAvailability")}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-bold text-ink">{t("proSpecs.title")}</h1>
      <p className="mt-2 text-ink-2">{t("proSpecs.sub")}</p>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("proSpecs.search")}
        className="mt-6 min-h-12 w-full rounded-[10px] border border-border bg-surface px-4 text-base"
      />
      {error ? (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {filtered.map((category) => (
          <Chip
            key={category.id}
            selected={selected.includes(category.id)}
            onClick={() =>
              setSelected((current) =>
                current.includes(category.id)
                  ? current.filter((item) => item !== category.id)
                  : [...current, category.id],
              )
            }
          >
            {category.emoji} {category.name}
          </Chip>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-3">{t("proSpecs.growing")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={save}>{t("proSpecs.save")}</Button>
        <ButtonLink
          href={fromOnboarding ? routes.professionalOnboarding : routes.professionalHome}
          variant="text"
        >
          {t("proSpecs.cancel")}
        </ButtonLink>
      </div>
    </div>
  );
}

export default function ProfessionalSpecialtiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <SpecialtiesInner />
    </Suspense>
  );
}
