import { cn } from "@/lib/cn";
import type { SlotStatus } from "@ethio-wellness/shared";

export function SlotChip({
  label,
  sublabel,
  status,
  selected,
  onClick,
  bookedClientFirstName,
  bookedPayout,
}: {
  label: string;
  sublabel?: string;
  status: SlotStatus;
  selected?: boolean;
  onClick?: () => void;
  /** Provider availability: first name of the booked client */
  bookedClientFirstName?: string;
  /** Provider availability: payout line, e.g. "+$25" */
  bookedPayout?: string;
}) {
  const booked = status === "booked";
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
      disabled={booked}
      onClick={onClick}
      className={cn(
        "flex min-h-11 flex-col items-center justify-center rounded-full px-3 py-2 text-sm",
        booked && "cursor-not-allowed bg-surface-warm text-ink-3",
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
