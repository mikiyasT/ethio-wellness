"use client";

import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";
import { useTheme, type Theme } from "@/lib/theme";
import { Check, ChevronDown, Moon, Sun } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const MODES: { id: Theme; labelKey: "chrome.bright" | "chrome.night"; icon: typeof Sun }[] = [
  { id: "light", labelKey: "chrome.bright", icon: Sun },
  { id: "dark", labelKey: "chrome.night", icon: Moon },
];

export function ModeSwitcher() {
  const { t } = useLocale();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("chrome.mode")}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-medium text-ink"
      >
        <Sun size={16} className="icon-sun text-ink-2" />
        <Moon size={16} className="icon-moon text-ink-2" />
        <span>{t("chrome.mode")}</span>
        <ChevronDown size={16} className={cn("text-ink-2 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("chrome.mode")}
          className="absolute right-0 z-50 mt-2 min-w-[12rem] overflow-hidden rounded-2xl border border-border bg-surface py-1 shadow-lg"
        >
          {MODES.map((item) => {
            const active = item.id === theme;
            const Icon = item.icon;
            return (
              <li key={item.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setTheme(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-3 px-3 text-left text-sm",
                    active ? "bg-primary-tint font-semibold text-primary" : "text-ink hover:bg-surface-warm",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon size={16} />
                    {t(item.labelKey)}
                  </span>
                  {active ? <Check size={16} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
