import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "text" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-surface text-ink border border-border-strong hover:bg-surface-warm",
  gold: "bg-gold text-white hover:bg-gold-hover",
  ghost: "bg-white/15 text-white hover:bg-white/25",
  outline: "bg-transparent text-ink border border-border-strong hover:bg-surface-warm",
  text: "bg-transparent text-primary hover:underline",
  danger: "bg-transparent text-error hover:bg-red-50",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-11 px-5 text-base",
  lg: "min-h-12 px-6 text-base",
};

interface SharedProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  block,
  className,
  ...props
}: SharedProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  block,
  className,
}: SharedProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}
