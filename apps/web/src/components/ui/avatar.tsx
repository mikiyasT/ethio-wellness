import { cn } from "@/lib/cn";
import Image from "next/image";

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-[7.25rem] w-[7.25rem] text-2xl",
} as const;

export function Avatar({
  initials,
  avatarClass,
  size = "md",
  photoUrl,
  name,
  shape,
}: {
  initials: string;
  avatarClass: string;
  size?: keyof typeof sizeClasses;
  /** When set, shows a photo (rounded square by default). */
  photoUrl?: string;
  name?: string;
  /** Defaults to rounded square when photoUrl is set, otherwise circle. */
  shape?: "circle" | "rounded";
}) {
  const resolvedShape = shape ?? (photoUrl ? "rounded" : "circle");
  const radius =
    resolvedShape === "rounded" ? "rounded-[12px]" : "keep-round rounded-full";

  if (photoUrl) {
    return (
      <span
        className={cn(
          "relative inline-block shrink-0 overflow-hidden bg-surface-warm",
          sizeClasses[size],
          radius,
        )}
      >
        <Image
          src={photoUrl}
          alt={name ? `${name} profile photo` : "Profile photo"}
          fill
          className="object-cover"
          sizes={
            size === "xl"
              ? "116px"
              : size === "lg"
                ? "64px"
                : size === "md"
                  ? "48px"
                  : "40px"
          }
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold text-on-primary",
        sizeClasses[size],
        radius,
        avatarClass,
      )}
    >
      {initials}
    </span>
  );
}
