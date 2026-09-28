"use client";

import { routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function ProfessionalPendingPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-ink">{t("proPending.title")}</h1>
      <p className="mt-4 leading-7 text-ink-2">{t("proPending.body")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <ButtonLink href={routes.professionalProfile}>{t("proHome.edit")}</ButtonLink>
        <ButtonLink href={routes.home} variant="secondary">
          {t("proPending.home")}
        </ButtonLink>
      </div>
    </div>
  );
}
