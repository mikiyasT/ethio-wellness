import { cn } from "@/lib/cn";

export function Avatar({
  initials,
  avatarClass,
  size = "md",
}: {
  initials: string;
  avatarClass: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        size === "sm" && "h-10 w-10 text-sm",
        size === "md" && "h-12 w-12 text-base",
        size === "lg" && "h-16 w-16 text-xl",
        avatarClass,
      )}
    >
      {initials}
    </span>
  );
}
