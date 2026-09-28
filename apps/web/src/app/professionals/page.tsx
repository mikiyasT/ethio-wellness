"use client";

import {
  LANGUAGES,
  categories,
  professionals,
  type CategoryId,
  type LanguageId,
} from "@ethio-wellness/shared";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/lib/locale";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [languages, setLanguages] = useState<LanguageId[]>([]);
  const [specialties, setSpecialties] = useState<CategoryId[]>(preset ? [preset] : []);
  const [availability, setAvailability] = useState("any");
  const [sort, setSort] = useState("soonest");
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(() => {
    const filtered = professionals.filter((professional) => {
      const matchesName = professional.name.toLowerCase().includes(query.toLowerCase());
      const matchesLanguage =
        languages.length === 0 || languages.some((language) => professional.languages.includes(language));
      const matchesSpecialty =
        specialties.length === 0 || specialties.some((specialty) => professional.specialties.includes(specialty));
      const matchesAvailability =
        availability === "any" ||
        (availability === "today" && professional.nextSlotLabel.toLowerCase().includes("today")) ||
        availability === "week";
      return matchesName && matchesLanguage && matchesSpecialty && matchesAvailability;
    });
    return [...filtered].sort((a, b) => (sort === "highest" ? b.rating - a.rating : 0));
  }, [query, languages, specialties, availability, sort]);

  function toggleLanguage(id: LanguageId) {
    setLanguages((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  function toggleSpecialty(id: CategoryId) {
    setSpecialties((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }
  function clear() {
    setQuery("");
    setLanguages([]);
    setSpecialties([]);
    setAvailability("any");
  }

  const filters = (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">{t("pros.searchLabel")}</span>
        <span className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("pros.search")}
            className="min-h-[46px] w-full rounded-full border border-border bg-surface pl-9 pr-3 text-sm"
          />
        </span>
      </label>
      <div>
        <p className="mb-2 text-sm font-medium">{t("pros.language")}</p>
        <div className="flex flex-wrap gap-2">
          <Chip selected={languages.length === 0} onClick={() => setLanguages([])}>
            {t("pros.all")}
          </Chip>
          {LANGUAGES.map((language) => (
            <Chip
              key={language.id}
              selected={languages.includes(language.id)}
              onClick={() => toggleLanguage(language.id)}
              eth={language.id === "amharic" || language.id === "tigrinya"}
            >
              {language.nativeLabel}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">{t("pros.specialty")}</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={specialties.includes(category.id)}
              onClick={() => toggleSpecialty(category.id)}
            >
              {category.name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">{t("pros.availability")}</p>
        <div className="flex flex-wrap gap-2">
          {[
            ["any", t("pros.anyTime")],
            ["today", t("pros.today")],
            ["week", t("pros.thisWeek")],
          ].map(([id, label]) => (
            <Chip key={id} selected={availability === id} onClick={() => setAvailability(id)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">{t("pros.sort")}</span>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="min-h-11 w-full rounded-[10px] border border-border bg-surface px-3"
        >
          <option value="soonest">{t("pros.soonest")}</option>
          <option value="highest">{t("pros.highest")}</option>
        </select>
      </label>
      <button type="button" onClick={clear} className="text-sm text-primary">
        {t("pros.clear")}
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      <h1 className="text-[32px] font-bold text-ink md:text-[40px]">{t("pros.title")}</h1>
      <p className="mt-2 max-w-2xl text-ink-2">{t("pros.sub")}</p>
      <div className="mt-6 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4"
        >
          <SlidersHorizontal size={16} /> {t("pros.filters")}
        </button>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-2xl border border-border bg-surface p-5 lg:block">{filters}</aside>
        <div>
          <p className="mb-4 text-sm text-ink-2">
            {t("pros.showing")} {results.length} {t("pros.count")}
          </p>
          {results.length === 0 ? (
            <EmptyState title={t("pros.emptyTitle")} body={t("pros.emptyBody")} actionHref="/professionals" actionLabel={t("pros.clear")} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {results.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))}
            </div>
          )}
        </div>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setSheetOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("pros.filters")}</h2>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close">
                <X />
              </button>
            </div>
            {filters}
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-white"
            >
              {t("pros.showResults")} {results.length}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
