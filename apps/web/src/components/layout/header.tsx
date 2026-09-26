"use client";

import {
  clientNav,
  guestNav,
  professionalNav,
  routes,
  type UserRole,
} from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "./language-switcher";

export function Header({ role }: { role: UserRole }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav =
    role === "client" ? clientNav : role === "professional" ? professionalNav : guestNav;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={role === "client" ? routes.clientHome : role === "professional" ? routes.professionalHome : routes.home} className="text-lg font-bold text-primary">
          {t("brand")}
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "min-h-11 inline-flex items-center text-sm font-medium",
                pathname === item.href ? "active text-primary" : "text-ink-2 hover:text-ink",
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
              <ButtonLink href={routes.login} variant="text" size="sm" className="hidden sm:inline-flex">
                {t("nav.signIn")}
              </ButtonLink>
              <ButtonLink href={routes.register} size="sm" className="btn-keep">
                {t("nav.createAccount")}
              </ButtonLink>
            </>
          ) : (
            <ButtonLink href={routes.account} variant="secondary" size="sm">
              {role === "professional" ? "HT" : "MT"}
            </ButtonLink>
          )}
          {role === "guest" ? (
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] border border-border lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen((value) => !value)}
            >
              ☰
            </button>
          ) : null}
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
