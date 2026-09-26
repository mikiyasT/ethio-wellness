"use client";

import { bookings, clients, routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function ProfessionalHomePage() {
  const { t } = useLocale();
  const upcoming = bookings.filter((booking) => booking.status === "upcoming").slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold text-ink">{t("proHome.hello")}</h1>
      <section className="mt-6 rounded-2xl border border-border bg-gold-tint p-6">
        <h2 className="font-semibold">{t("proHome.complete")}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-2">
          <li>Add a short bio</li>
          <li>Choose specialties</li>
          <li>Set this week's availability</li>
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-semibold">{t("proHome.upcoming")}</h2>
        <div className="mt-4 space-y-3">
          {upcoming.map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold">{clients.find((client) => client.id === booking.clientId)?.name}</p>
              <p className="text-sm text-ink-2">{booking.dateLabel}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={routes.professionalAvailability}>{t("proHome.availability")}</ButtonLink>
        <ButtonLink href={routes.professionalBookings} variant="secondary">
          {t("proHome.bookings")}
        </ButtonLink>
        <ButtonLink href={routes.professionalProfile} variant="text">
          {t("proHome.edit")}
        </ButtonLink>
      </div>
    </div>
  );
}
