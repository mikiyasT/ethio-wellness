"use client";

import { routes } from "@ethio-wellness/shared";
import { useLocale } from "@/lib/locale";
import Link from "next/link";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="mt-auto bg-primary-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="font-semibold">{t("brand")}</p>
          <p className="mt-3 text-sm leading-6 text-white/80">{t("footer.about")}</p>
        </div>
        <div>
          <p className="font-semibold">{t("footer.explore")}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <Link href={routes.services}>{t("nav.services")}</Link>
            <Link href={routes.professionals}>{t("nav.professionals")}</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">{t("footer.support")}</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <span>{t("footer.help")}</span>
            <span>{t("footer.contact")}</span>
            <span>{t("footer.privacy")}</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">{t("footer.legal")}</p>
          <div className="mt-3 text-sm text-white/80">{t("footer.terms")}</div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-sm text-white/70">
        {t("footer.base")}
      </div>
    </footer>
  );
}
