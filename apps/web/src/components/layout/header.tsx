"use client";

import {
  clientNav,
  guestNav,
  professionalNav,
  routes,
  type UserRole,
} from "@ethio-wellness/shared";
import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "./language-switcher";

export function Header({ role }: { role: UserRole }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = role === "client" ? clientNav : role === "professional" ? professionalNav : guestNav;
  const homeHref =
    role === "client" ? routes.clientHome : role === "professional" ? routes.professionalHome : routes.home;

  function isActive(href: string) {
    if (href === routes.home || href === routes.clientHome || href === routes.professionalHome) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1200px] items-center justify-between gap-4 px-4">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold text-ink">
          <BrandMark />
          <span className="hidden sm:inline">{t("brand")}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium",
                isActive(item.href) ? "bg-primary-tint text-primary" : "text-ink-2 hover:bg-surface-warm",
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {role === "guest" ? (
            <>
              <ButtonLink href={routes.login} variant="outline" size="sm" className="hidden sm:inline-flex btn-keep">
                {t("nav.signIn")}
              </ButtonLink>
              <ButtonLink href={routes.register} size="sm" className="btn-keep">
                {t("nav.createAccount")}
              </ButtonLink>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          ) : (
            <ButtonLink href={routes.account} variant="secondary" size="sm" className="h-10 w-10 !px-0">
              {role === "professional" ? "HT" : "MT"}
            </ButtonLink>
          )}
        </div>
      </div>

      {open && role === "guest" ? (
        <nav className="border-t border-border px-4 py-3 lg:hidden">
          {guestNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block min-h-11 py-2 text-ink"
            >
              {t(item.labelKey)}
            </Link>
          ))}
          <Link href={routes.login} className="block min-h-11 py-2 text-ink" onClick={() => setOpen(false)}>
            {t("nav.signIn")}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
