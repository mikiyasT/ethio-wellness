"use client";

import { LOCALES } from "@ethio-wellness/shared";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Language">
      {LOCALES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setLocale(item.id)}
          className={cn(
            "min-h-11 rounded-full px-2.5 text-sm",
            item.id === "ti" || item.id === "om" ? "hidden md:inline-flex" : "inline-flex",
            locale === item.id ? "bg-primary-tint font-semibold text-primary" : "text-ink-2",
            item.eth && "eth",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
