import { cn } from "@/lib/cn";
import type { SlotStatus } from "@ethio-wellness/shared";

export function SlotChip({
  label,
  sublabel,
  status,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  status: SlotStatus;
  selected?: boolean;
  onClick?: () => void;
}) {
  const booked = status === "booked";
  const closed = status === "closed";

  return (
    <button
      type="button"
      disabled={booked}
      onClick={onClick}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center rounded-full px-3 py-2 text-sm",
        booked && "cursor-not-allowed bg-surface-warm text-ink-3 line-through decoration-ink-3",
        closed && !selected && "border border-dashed border-border bg-transparent text-ink-3",
        !booked && selected && "bg-primary text-white",
        !booked && !closed && !selected && "border border-border bg-surface text-ink hover:bg-primary-tint",
      )}
    >
      <span>{label}</span>
      {sublabel ? <span className="text-[11px] font-normal opacity-80">{sublabel}</span> : null}
    </button>
  );
}
