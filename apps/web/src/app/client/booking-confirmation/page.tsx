"use client";

import { professionals, routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function BookingConfirmationPage() {
  const { t } = useLocale();
  const professional = professionals[0];

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-ink">{t("confirm.title")}</h1>
      <p className="mt-2 text-ink-2">{t("confirm.sub")}</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-left">
        <p className="font-semibold">{professional.name}</p>
        <p className="text-ink-2">Individual Mental Health</p>
        <p className="mt-2">Sat Oct 3, 4:00 PM EAT</p>
        <p>{t("book.duration")}</p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <ButtonLink href={routes.clientSessions}>{t("confirm.view")}</ButtonLink>
        <ButtonLink href={routes.clientHome} variant="secondary">
          {t("confirm.home")}
        </ButtonLink>
        <ButtonLink href={routes.professionals} variant="text">
          {t("confirm.browse")}
        </ButtonLink>
      </div>
    </div>
  );
}
