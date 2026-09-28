"use client";

import { LOCALES } from "@ethio-wellness/shared";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";

export function LanguageSwitcher({ inverted = false }: { inverted?: boolean }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Language">
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setLocale(item.id)}
          className={cn(
            "min-h-9 rounded-full px-2.5 text-sm font-medium",
            (item.id === "ti" || item.id === "om") && "hidden md:inline-flex",
            item.id !== "ti" && item.id !== "om" && "inline-flex",
            locale === item.id
              ? "bg-primary text-white"
              : inverted
                ? "text-white/80 hover:bg-white/10"
                : "text-ink-2 hover:bg-surface-warm",
            item.eth && "eth",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
