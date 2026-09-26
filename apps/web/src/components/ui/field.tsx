import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  error?: string;
}

export function TextField({
  label,
  error,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        className={cn(
          "w-full min-h-[50px] rounded-[10px] border bg-surface px-3 text-base text-ink placeholder:text-ink-3",
          error ? "border-error" : "border-border",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-sm text-error">{error}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  error,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea
        className={cn(
          "w-full min-h-28 rounded-[10px] border bg-surface px-3 py-3 text-base text-ink placeholder:text-ink-3",
          error ? "border-error" : "border-border",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-sm text-error">{error}</span> : null}
    </label>
  );
}
