"use client";

import { bookings, professionalById, professionals, routes } from "@ethio-wellness/shared";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function ClientHomePage() {
  const { t } = useLocale();
  const next = bookings.find((booking) => booking.status === "upcoming");
  const professional = next ? professionalById(next.professionalId) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold text-ink">{t("clientHome.hello")}</h1>
      {next && professional ? (
        <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm font-semibold text-gold">{t("clientHome.next")}</p>
          <h2 className="mt-2 text-2xl font-semibold">{professional.name}</h2>
          <p className="text-ink-2">{next.dateLabel}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.clientSessionDetail(next.id)}>{t("sessions.join")}</ButtonLink>
            <ButtonLink href={routes.clientSessionDetail(next.id)} variant="secondary">
              {t("sessions.details")}
            </ButtonLink>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">{t("clientHome.recommended")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {professionals.slice(0, 3).map((item) => (
            <ProfessionalCard key={item.id} professional={item} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">{t("clientHome.continue")}</h2>
        <div className="mt-4">
          <ButtonLink href={routes.professionals}>{t("home.ctaProfessionals")}</ButtonLink>
        </div>
      </section>
    </div>
  );
}
