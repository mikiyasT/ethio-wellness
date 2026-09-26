"use client";

import { routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function SessionExpiredPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-ink">{t("expired.title")}</h1>
      <p className="mt-3 text-ink-2">{t("expired.body")}</p>
      <div className="mt-6">
        <ButtonLink href={routes.login}>{t("nav.signIn")}</ButtonLink>
      </div>
    </div>
  );
}
