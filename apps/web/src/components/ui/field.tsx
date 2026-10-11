import { cn } from "@/lib/cn";
import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  error?: string;
  /** Login passwords can be revealed so the person can check what they typed. */
  revealable?: boolean;
}

export function TextField({
  label,
  error,
  className,
  type,
  revealable,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const canReveal = revealable && type === "password";
  const inputType = canReveal && visible ? "text" : type;

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="relative block">
        <input
          type={inputType}
          className={cn(
            "w-full min-h-[50px] rounded-full border bg-surface px-4 text-base text-ink placeholder:text-ink-3",
            canReveal && "pr-12",
            error ? "border-error" : "border-border",
            className,
          )}
          {...props}
        />
        {canReveal ? (
          <button
            type="button"
            className="absolute top-1/2 right-1.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 hover:text-ink"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
          </button>
        ) : null}
      </span>
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
