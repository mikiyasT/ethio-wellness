"use client";

import { categories } from "@ethio-wellness/shared";
import { Chip } from "@/components/ui/chip";
import { useLocale } from "@/lib/locale";
import { useState } from "react";

export default function ProfessionalSpecialtiesPage() {
  const { t } = useLocale();
  const [selected, setSelected] = useState<string[]>(["individual-mental-health", "grief-and-loss"]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("proSpecs.title")}</h1>
      <p className="mt-2 text-ink-2">{t("proSpecs.sub")}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
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
            {category.name}
          </Chip>
        ))}
      </div>
      <button type="button" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-[10px] bg-primary px-5 font-semibold text-white">
        {t("proSpecs.save")}
      </button>
    </div>
  );
}
