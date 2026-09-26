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

  const results = useMemo(() => {
    return professionals.filter((professional) => {
      const matchesName = professional.name.toLowerCase().includes(query.toLowerCase());
      const matchesLanguage =
        languages.length === 0 || languages.some((language) => professional.languages.includes(language));
      const matchesSpecialty =
        specialties.length === 0 || specialties.some((specialty) => professional.specialties.includes(specialty));
      return matchesName && matchesLanguage && matchesSpecialty;
    });
  }, [query, languages, specialties]);

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
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold text-ink">{t("pros.title")}</h1>
      <p className="mt-2 text-ink-2">{t("pros.sub")}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("pros.search")}
            className="min-h-[50px] w-full rounded-[10px] border border-border bg-surface px-3"
          />
          <div className="flex flex-wrap gap-2">
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
          <button type="button" onClick={clear} className="text-sm text-primary">
            {t("pros.clear")}
          </button>
        </aside>
        <div>
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
    </div>
  );
}
