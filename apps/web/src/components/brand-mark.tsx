import { cn } from "@/lib/cn";

export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "keep-round inline-flex items-center justify-center rounded-full bg-primary font-bold text-white",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-9 w-9 text-sm",
        size === "lg" && "h-14 w-14 text-lg",
      )}
      aria-hidden
    >
      AZ
    </span>
  );
}
