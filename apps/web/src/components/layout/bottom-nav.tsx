"use client";

import { clientMobileNav, professionalMobileNav, type UserRole } from "@ethio-wellness/shared";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";
import { CalendarDays, Clock3, Home, Settings, UserRound, Users, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "/client": Home,
  "/join": Video,
  "/professionals": Users,
  "/client/sessions": CalendarDays,
  "/account": Settings,
  "/professional": Home,
  "/professional/bookings": CalendarDays,
  "/professional/availability": Clock3,
  "/professional/profile": UserRound,
};

export function BottomNav({ role }: { role: UserRole }) {
  const { t } = useLocale();
  const pathname = usePathname();
  if (role === "guest") return null;
  const items = role === "professional" ? professionalMobileNav : clientMobileNav;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:hidden">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = icons[item.href] ?? Home;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-center text-[11px]",
                active ? "font-semibold text-teal-accent" : "text-ink-2",
              )}
            >
              <Icon size={18} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
