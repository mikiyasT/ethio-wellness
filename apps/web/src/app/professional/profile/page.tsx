"use client";

import { professionals, routes } from "@ethio-wellness/shared";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function ProfessionalProfilePage() {
  const { t } = useLocale();
  const professional = professionals[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("proProfile.title")}</h1>
      <p className="mt-2 text-ink-2">{t("proProfile.note")}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={routes.professionalOnboarding}>{t("proProfile.edit")}</ButtonLink>
        <ButtonLink href={routes.professionalSpecialties} variant="secondary">
          {t("proProfile.specialties")}
        </ButtonLink>
        <ButtonLink href={routes.professionalAvailability} variant="text">
          {t("proProfile.availability")}
        </ButtonLink>
      </div>
      <div className="mt-8">
        <ProfessionalCard professional={professional} />
      </div>
    </div>
  );
}
