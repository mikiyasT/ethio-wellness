"use client";

import {
  clientSidebar,
  professionalSidebar,
  type UserRole,
} from "@ethio-wellness/shared";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";
import { CalendarDays, Clock3, Home, Settings, Sparkles, Stethoscope, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "/client": Home,
  "/services": Sparkles,
  "/professionals": Users,
  "/client/sessions": CalendarDays,
  "/account": Settings,
  "/professional": Home,
  "/professional/bookings": CalendarDays,
  "/professional/availability": Clock3,
  "/professional/specialties": Stethoscope,
  "/professional/profile": UserRound,
};

export function Sidebar({ role }: { role: UserRole }) {
  const { t } = useLocale();
  const pathname = usePathname();
  if (role === "guest") return null;
  const items = role === "professional" ? professionalSidebar : clientSidebar;

  return (
    <aside className="hidden w-[250px] shrink-0 lg:block">
      <nav className="sticky top-24 rounded-2xl border border-border bg-surface p-3">
        {items.map((item) => {
          const Icon = icons[item.href] ?? Home;
          const active = pathname === item.href || (item.href !== "/client" && item.href !== "/professional" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm",
                active ? "bg-primary-tint font-semibold text-primary" : "text-ink-2 hover:bg-surface-warm",
              )}
            >
              <Icon size={18} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
