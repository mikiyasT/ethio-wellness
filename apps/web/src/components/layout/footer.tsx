"use client";

import { routes } from "@ethio-wellness/shared";
import { BrandMark } from "@/components/brand-mark";
import { useLocale } from "@/lib/locale";
import Link from "next/link";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="mt-auto border-t border-border bg-surface text-ink">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <BrandMark />
            <p className="font-semibold">{t("brand")}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-ink-2">{t("footer.about")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t("footer.explore")}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-ink-2">
            <Link href={routes.services} className="text-teal-accent hover:underline">
              {t("nav.services")}
            </Link>
            <Link href={routes.professionals} className="text-teal-accent hover:underline">
              {t("nav.professionals")}
            </Link>
            <Link href={routes.join} className="text-teal-accent hover:underline">
              {t("confirm.joinLink")}
            </Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t("footer.support")}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-ink-2">
            <span>{t("footer.help")}</span>
            <span>{t("footer.contact")}</span>
            <span>{t("footer.privacy")}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t("footer.legal")}</p>
          <div className="mt-3 text-sm text-ink-2">{t("footer.terms")}</div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-sm text-ink-3">
        {t("footer.base")}
      </div>
    </footer>
  );
}
