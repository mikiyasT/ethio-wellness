import { cn } from "@/lib/cn";

export function Alert({
  tone = "info",
  icon,
  children,
}: {
  tone?: "success" | "warning" | "error" | "info";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border px-4 py-3 text-sm",
        Boolean(icon) && "flex items-start gap-3",
        tone === "success" && "border-primary bg-primary-tint text-primary",
        tone === "warning" && "border-gold bg-gold-tint text-warning",
        tone === "error" && "border-error/40 bg-surface text-error",
        tone === "info" && "border-info/30 bg-surface text-info",
      )}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
