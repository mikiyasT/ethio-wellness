"use client";

import type { Category } from "@ethio-wellness/shared";
import { routes } from "@ethio-wellness/shared";
import { useLocale } from "@/lib/locale";
import Link from "next/link";

export function CategoryCard({
  category,
  count,
  compact = false,
}: {
  category: Category;
  count?: number;
  compact?: boolean;
}) {
  const { t } = useLocale();

  return (
    <Link
      href={`${routes.professionals}?specialty=${category.id}`}
      className="block rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-tint text-2xl">
        {category.emoji}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{category.name}</h3>
      {!compact ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-2">{category.description}</p> : null}
      {typeof count === "number" ? (
        <p className="mt-4 text-sm text-ink-3">
          {count} {t("services.available")}
        </p>
      ) : null}
    </Link>
  );
}
