"use client";

import { cn } from "@/lib/cn";
import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type MultiSelectOption = {
  id: string;
  label: string;
  eth?: boolean;
};

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select",
  clearLabel = "Clear",
  doneLabel = "Done",
}: {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  clearLabel?: string;
  doneLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
      return;
    }
    onChange([...selected, id]);
  }

  function summary() {
    if (selected.length === 0) return placeholder;
    const first = options.find((option) => option.id === selected[0]);
    const firstLabel = first?.label ?? selected[0]!;
    if (selected.length === 1) return firstLabel;
    return `${firstLabel} +${selected.length - 1}`;
  }

  const firstSelected = options.find((option) => option.id === selected[0]);

  return (
    <div ref={rootRef} className="relative w-full">
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex min-h-12 w-full items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-4 text-left text-sm",
          open && "border-border-strong ring-2 ring-primary/30",
        )}
      >
        <span
          className={cn(
            "min-w-0 truncate font-medium",
            selected.length === 0 ? "text-ink-3" : "text-ink",
            selected.length > 0 && firstSelected?.eth && "eth",
          )}
        >
          {summary()}
        </span>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-ink-2 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
          className="absolute left-0 right-0 z-30 mt-2 rounded-[10px] border border-border bg-surface p-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
        >
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {options.map((option) => {
              const checked = selected.includes(option.id);
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggle(option.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 text-left text-sm hover:bg-surface-warm",
                      checked && "bg-primary-tint",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                        checked
                          ? "border-primary bg-primary text-on-primary"
                          : "border-border-strong bg-surface",
                      )}
                      aria-hidden
                    >
                      {checked ? <Check size={14} strokeWidth={3} /> : null}
                    </span>
                    <span className={cn("font-medium text-ink", option.eth && "eth")}>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <button
              type="button"
              className="text-sm font-semibold text-teal-accent hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              disabled={selected.length === 0}
              onClick={() => onChange([])}
            >
              {clearLabel}
            </button>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-on-primary"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              {doneLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FilterChip({
  children,
  onRemove,
  eth,
  removeLabel = "Remove",
}: {
  children: React.ReactNode;
  onRemove: () => void;
  eth?: boolean;
  removeLabel?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm text-ink",
        eth && "eth",
      )}
    >
      {children}
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-2 hover:bg-surface-warm hover:text-ink"
      >
        <X size={14} />
      </button>
    </span>
  );
}
