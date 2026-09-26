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
    <div className="flex gap-4 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "min-h-11 border-b-2 px-1 text-base",
            value === tab.id
              ? "border-primary font-semibold text-primary"
              : "border-transparent text-ink-2",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
