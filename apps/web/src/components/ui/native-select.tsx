"use client";

import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import { type ReactNode } from "react";

export function NativeSelect({
  label,
  value,
  onChange,
  children,
  className,
  chrome,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  chrome?: "theme" | "locale";
}) {
  function apply(next: string) {
    if (!next || next === value) return;
    onChange(next);
  }

  return (
    <div className={cn("relative z-20 inline-flex shrink-0 items-center", className)}>
      <select
        aria-label={label}
        data-chrome={chrome}
        value={value}
        onChange={(event) => apply(event.currentTarget.value)}
        onInput={(event) => apply(event.currentTarget.value)}
        className="h-11 min-w-[6.5rem] cursor-pointer appearance-none rounded-full border border-border bg-surface py-0 pl-3 pr-8 text-sm font-medium text-ink"
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-2.5 text-ink-2" />
    </div>
  );
}
