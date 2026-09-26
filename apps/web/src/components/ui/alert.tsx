import { cn } from "@/lib/cn";

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "success" | "warning" | "error" | "info";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border px-4 py-3 text-sm",
        tone === "success" && "border-primary bg-primary-tint text-primary",
        tone === "warning" && "border-gold bg-gold-tint text-warning",
        tone === "error" && "border-error/40 bg-red-50 text-error",
        tone === "info" && "border-info/30 bg-blue-50 text-info",
      )}
    >
      {children}
    </div>
  );
}
