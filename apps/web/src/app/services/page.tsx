"use client";

import { categories, professionals, routes } from "@ethio-wellness/shared";
import { CategoryCard } from "@/components/domain/category-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/lib/locale";
import { Search } from "lucide-react";
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
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      <h1 className="max-w-3xl text-[32px] font-bold leading-tight text-ink md:text-[40px]">{t("services.title")}</h1>
      <p className="mt-3 text-ink-2">{t("services.sub")}</p>
      <label className="relative mt-6 block max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("services.search")}
          className="min-h-[50px] w-full rounded-full border border-border bg-surface pl-10 pr-4"
        />
      </label>
      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("pros.emptyTitle")} body={t("pros.emptyBody")} actionHref={routes.services} actionLabel={t("pros.clear")} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              count={professionals.filter((item) => item.specialties.includes(category.id)).length}
            />
          ))}
        </div>
      )}
      <div className="mt-8 rounded-2xl border border-dashed border-border-strong bg-surface p-8 text-center">
        <p className="font-semibold text-ink">{t("services.more")}</p>
        <a href="mailto:hello@ethiowellness.example" className="mt-3 inline-flex min-h-11 items-center text-primary">
          {t("services.request")}
        </a>
      </div>
    </div>
  );
}
