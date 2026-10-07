import { cn } from "@/lib/cn";
import type { SlotStatus } from "@ethio-wellness/shared";

export function SlotChip({
  label,
  sublabel,
  status,
  selected,
  pending,
  pendingRemove,
  onClick,
  bookedClientFirstName,
  bookedPayout,
  size = "md",
}: {
  label: string;
  sublabel?: string;
  status: SlotStatus;
  selected?: boolean;
  /** Unsaved open — softer green until Save availability */
  pending?: boolean;
  /** Unsaved remove — strikethrough hour until Save availability */
  pendingRemove?: boolean;
  onClick?: () => void;
  /** Provider availability: first name of the booked client */
  bookedClientFirstName?: string;
  /** Provider availability: payout line, e.g. "+$25" */
  bookedPayout?: string;
  /** `sm` = compact chips for full-day grids */
  size?: "sm" | "md";
}) {
  const booked = status === "booked";
  const held = status === "held";
  const locked = booked || held;
  const closed = status === "closed";
  const showBookedCard = booked && (bookedClientFirstName != null || bookedPayout != null);
  const compact = size === "sm";

  if (showBookedCard) {
    const clientLine = bookedClientFirstName
      ? `Booked · ${bookedClientFirstName}`
      : "Booked";
    return (
      <div
        role="status"
        aria-label={`${label}, ${clientLine}${bookedPayout ? `, ${bookedPayout}` : ""}`}
        className={cn(
          "relative flex flex-col items-center justify-center gap-0 text-center text-booked-ink",
          compact
            ? "min-h-8 rounded-xl px-1.5 py-1 text-[11px]"
            : "min-h-11 rounded-2xl px-3 py-2 text-sm",
        )}
        style={{
          background: "linear-gradient(135deg, var(--booked-from) 0%, var(--booked-to) 100%)",
        }}
      >
        {bookedPayout ? (
          <span
            className={cn(
              "absolute font-semibold leading-none text-white",
              compact ? "right-1 top-0.5 text-[9px]" : "right-2 top-1.5 text-[11px]",
            )}
          >
            {bookedPayout}
          </span>
        ) : null}
        <span className={cn("font-semibold leading-tight", compact ? "px-3" : "px-8")}>{label}</span>
        <span
          className={cn(
            "font-medium leading-tight opacity-90",
            compact ? "px-3 text-[9px]" : "px-8 text-[11px]",
          )}
        >
          {clientLine}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center",
        compact
          ? "min-h-8 rounded-xl px-1.5 py-1 text-[11px] leading-tight"
          : "min-h-11 rounded-full px-3 py-2 text-sm",
        locked && "cursor-not-allowed bg-surface-warm text-ink-3",
        pendingRemove && "border border-error/40 bg-surface-warm text-error",
        closed && !selected && !pendingRemove && "border border-dashed border-border bg-transparent text-ink-3",
        !locked && selected && pending && "border border-avail/40 bg-avail-tint text-avail",
        !locked && selected && !pending && "bg-avail text-white",
        !locked && !closed && !selected && "border border-border bg-surface text-ink hover:bg-avail-tint",
      )}
    >
      <span className={cn(pendingRemove && "line-through decoration-error/70")}>{label}</span>
      {sublabel ? (
        <span className={cn("font-normal opacity-80", compact ? "text-[9px]" : "text-[11px]")}>
          {sublabel}
        </span>
      ) : null}
      {held && !sublabel ? (
        <span className={cn("font-normal opacity-80", compact ? "text-[9px]" : "text-[11px]")}>
          Held
        </span>
      ) : null}
    </button>
  );
}
