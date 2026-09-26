import { cn } from "@/lib/cn";

export function SlotChip({
  label,
  status,
  selected,
  onClick,
}: {
  label: string;
  status: "open" | "booked";
  selected?: boolean;
  onClick?: () => void;
}) {
  const booked = status === "booked";

  return (
    <button
      type="button"
      disabled={booked}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-3 text-sm",
        booked && "cursor-not-allowed bg-surface-warm text-ink-3",
        !booked && selected && "bg-primary text-white",
        !booked && !selected && "border border-border bg-surface text-ink hover:bg-primary-tint",
      )}
    >
      {label}
    </button>
  );
}
