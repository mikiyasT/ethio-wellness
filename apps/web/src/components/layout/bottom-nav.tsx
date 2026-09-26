"use client";

import { clientMobileNav, professionalMobileNav, type UserRole } from "@ethio-wellness/shared";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav({ role }: { role: UserRole }) {
  const { t } = useLocale();
  const pathname = usePathname();
  if (role === "guest") return null;
  const items = role === "professional" ? professionalMobileNav : clientMobileNav;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface md:hidden">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-14 items-center justify-center px-1 text-center text-xs",
              pathname === item.href ? "font-semibold text-primary" : "text-ink-2",
            )}
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
