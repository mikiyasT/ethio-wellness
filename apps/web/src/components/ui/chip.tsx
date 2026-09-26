import { cn } from "@/lib/cn";

export function Chip({
  children,
  selected,
  onClick,
  eth,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  eth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full border px-3 text-sm",
        selected
          ? "border-primary bg-primary-tint text-primary"
          : "border-border bg-surface text-ink hover:bg-surface-warm",
        eth && "eth",
      )}
    >
      {children}
    </button>
  );
}

export function Tag({ children, eth }: { children: React.ReactNode; eth?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-surface-warm px-2.5 py-1 text-xs text-ink-2",
        eth && "eth",
      )}
    >
      {children}
    </span>
  );
}
