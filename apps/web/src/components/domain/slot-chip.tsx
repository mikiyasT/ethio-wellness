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
}) {
  const booked = status === "booked";
  const held = status === "held";
  const locked = booked || held;
  const closed = status === "closed";
  const showBookedCard = booked && (bookedClientFirstName != null || bookedPayout != null);

  if (showBookedCard) {
    const clientLine = bookedClientFirstName
      ? `Booked · ${bookedClientFirstName}`
      : "Booked";
    return (
      <div
        role="status"
        aria-label={`${label}, ${clientLine}${bookedPayout ? `, ${bookedPayout}` : ""}`}
        className="relative flex min-h-11 flex-col items-center justify-center gap-0 rounded-2xl px-3 py-2 text-center text-sm text-[#1A1208]"
        style={{
          background: "linear-gradient(135deg, #F6BE4A 0%, #E8833A 100%)",
        }}
      >
        {bookedPayout ? (
          <span className="absolute right-2 top-1.5 text-[11px] font-semibold leading-none text-white">
            {bookedPayout}
          </span>
        ) : null}
        <span className="px-8 font-semibold leading-tight">{label}</span>
        <span className="px-8 text-[11px] font-medium leading-tight opacity-90">{clientLine}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center rounded-full px-3 py-2 text-sm",
        locked && "cursor-not-allowed bg-surface-warm text-ink-3",
        pendingRemove && "border border-error/40 bg-surface-warm text-error",
        closed && !selected && !pendingRemove && "border border-dashed border-border bg-transparent text-ink-3",
        !locked && selected && pending && "border border-primary/40 bg-primary-tint text-primary",
        !locked && selected && !pending && "bg-primary text-white",
        !locked && !closed && !selected && "border border-border bg-surface text-ink hover:bg-primary-tint",
      )}
    >
      <span className={cn(pendingRemove && "line-through decoration-error/70")}>{label}</span>
      {sublabel ? <span className="text-[11px] font-normal opacity-80">{sublabel}</span> : null}
      {held && !sublabel ? <span className="text-[11px] font-normal opacity-80">Held</span> : null}
    </button>
  );
}
