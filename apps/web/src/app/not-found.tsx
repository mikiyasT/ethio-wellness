"use client";

import { routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function NotFoundPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-ink">{t("notFound.title")}</h1>
      <p className="mt-3 text-ink-2">{t("notFound.body")}</p>
      <div className="mt-6">
        <ButtonLink href={routes.home}>{t("notFound.cta")}</ButtonLink>
      </div>
    </div>
  );
}
