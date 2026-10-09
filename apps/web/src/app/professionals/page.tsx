"use client";

import {
  LANGUAGES,
  categories,
  categoryById,
  type CategoryId,
  type LanguageId,
  type Professional,
} from "@ethio-wellness/shared";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { FilterChip, MultiSelect } from "@/components/ui/multi-select";
import { db, toCardProfessional } from "@/lib/db";
import { fetchApprovedProfessionals, usePublicApi } from "@/lib/public-api";
import { useLocale } from "@/lib/locale";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ProfessionalsPage() {
  return (
    <Suspense>
      <ProfessionalsDirectory />
    </Suspense>
  );
}

function ProfessionalsDirectory() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const preset = searchParams.get("specialty") as CategoryId | null;
  const [directory, setDirectory] = useState<Professional[]>([]);
  const [languages, setLanguages] = useState<LanguageId[]>([]);
  const [specialties, setSpecialties] = useState<CategoryId[]>(preset ? [preset] : []);

  useEffect(() => {
    void (async () => {
      const approved = usePublicApi()
        ? await fetchApprovedProfessionals()
        : await db.professionals.list({ status: "approved" });
      setDirectory(approved.map((pro) => toCardProfessional(pro)));
    })();
  }, []);

  useEffect(() => {
    if (!preset) return;
    setSpecialties((current) => (current.includes(preset) ? current : [preset, ...current]));
  }, [preset]);

  const languageOptions = useMemo(
    () =>
      LANGUAGES.map((language) => ({
        id: language.id,
        label: language.nativeLabel,
        eth: language.id === "amharic" || language.id === "tigrinya",
      })),
    [],
  );

  const specialtyOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        label: category.name,
      })),
    [],
  );

  const results = useMemo(() => {
    return directory.filter((professional) => {
      const matchesLanguage =
        languages.length === 0 || languages.some((language) => professional.languages.includes(language));
      const matchesSpecialty =
        specialties.length === 0 ||
        specialties.some((specialty) => professional.specialties.includes(specialty));
      return matchesLanguage && matchesSpecialty;
    });
  }, [directory, languages, specialties]);

  const hasActiveFilters = languages.length > 0 || specialties.length > 0;

  function clearAll() {
    setLanguages([]);
    setSpecialties([]);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-12">
      <h1 className="text-[32px] font-bold text-ink md:text-[40px]">{t("pros.title")}</h1>
      <p className="mt-2 max-w-2xl text-ink-2">{t("pros.sub")}</p>

      <div className="mt-8 w-full">
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <MultiSelect
            label={t("filters.language")}
            options={languageOptions}
            selected={languages}
            onChange={(ids) => setLanguages(ids as LanguageId[])}
            placeholder={t("filters.languagePlaceholder")}
            clearLabel={t("filters.clear")}
            doneLabel={t("filters.done")}
          />
          <MultiSelect
            label={t("filters.specialty")}
            options={specialtyOptions}
            selected={specialties}
            onChange={(ids) => setSpecialties(ids as CategoryId[])}
            placeholder={t("filters.specialtyPlaceholder")}
            clearLabel={t("filters.clear")}
            doneLabel={t("filters.done")}
          />
        </div>

        {hasActiveFilters ? (
          <div className="mt-4 flex w-full flex-wrap items-center gap-2">
            {languages.map((id) => {
              const language = LANGUAGES.find((item) => item.id === id);
              return (
                <FilterChip
                  key={id}
                  eth={id === "amharic" || id === "tigrinya"}
                  removeLabel={t("filters.remove")}
                  onRemove={() => setLanguages((current) => current.filter((item) => item !== id))}
                >
                  {language?.nativeLabel ?? id}
                </FilterChip>
              );
            })}
            {specialties.map((id) => (
              <FilterChip
                key={id}
                removeLabel={t("filters.remove")}
                onRemove={() => setSpecialties((current) => current.filter((item) => item !== id))}
              >
                {categoryById(id)?.name ?? id}
              </FilterChip>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="min-h-9 px-2 text-sm font-semibold text-teal-accent hover:underline"
            >
              {t("filters.clearAll")}
            </button>
          </div>
        ) : null}
      </div>

      <p className="mb-4 mt-8 text-sm text-ink-2">
        {t("pros.showing")} {results.length} {t("pros.count")}
      </p>

      {results.length === 0 ? (
        <div className="w-full rounded-2xl border border-border bg-surface p-8 text-center">
          <h2 className="text-xl font-semibold text-ink">{t("pros.emptyTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("pros.emptyBody")}</p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 font-semibold text-on-primary"
            >
              {t("filters.clearAll")}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))}
        </div>
      )}
    </div>
  );
}
