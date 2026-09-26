"use client";

import { categories, professionals, routes } from "@ethio-wellness/shared";
import { CategoryCard } from "@/components/domain/category-card";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";
import { useMemo, useState } from "react";

export default function ServicesPage() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      categories.filter((category) =>
        `${category.name} ${category.description}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold text-ink">{t("services.title")}</h1>
      <p className="mt-2 text-ink-2">{t("services.sub")}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("services.search")}
          className="min-h-[50px] flex-1 rounded-[10px] border border-border bg-surface px-3"
        />
        <ButtonLink href={routes.services} variant="text">
          {t("home.seeAll")}
        </ButtonLink>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            count={professionals.filter((item) => item.specialties.includes(category.id)).length}
          />
        ))}
      </div>
    </div>
  );
}
