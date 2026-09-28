import { cn } from "@/lib/cn";

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-[10px] border border-border bg-surface">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "min-h-11 shrink-0 px-4 text-sm",
            index > 0 && "border-l border-border",
            value === tab.id
              ? "bg-bg font-semibold text-ink"
              : "text-ink-2 hover:bg-surface-warm hover:text-ink",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
