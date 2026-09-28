"use client";

import { bookings, categoryById, clients, routes } from "@ethio-wellness/shared";
import { SessionCard } from "@/components/domain/session-card";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

const avatars: Record<string, string> = {
  MT: "av-1",
  SB: "av-4",
  DH: "av-8",
};

export default function ProfessionalHomePage() {
  const { t } = useLocale();
  const upcoming = bookings.filter((booking) => booking.status === "upcoming");
  const next = upcoming[0];
  const nextClient = next ? clients.find((client) => client.id === next.clientId) : undefined;

  return (
    <div>
      <h1 className="text-[32px] font-bold text-ink md:text-[40px]">{t("proHome.hello")}</h1>
      <p className="mt-2 text-ink-2">{t("proHome.dateLine")}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["3", t("proHome.sessionsToday")],
          ["12", t("proHome.upcoming")],
          ["4.9 ★", t("proHome.avgRating")],
          ["$300", t("proHome.earned")],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-2xl font-bold text-ink">{value}</p>
            <p className="mt-1 text-sm text-ink-2">{label}</p>
          </div>
        ))}
      </div>

      {next && nextClient ? (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">{t("proHome.nextSession")}</h2>
          <SessionCard
            initials={nextClient.initials}
            avatarClass={avatars[nextClient.initials] ?? "av-1"}
            title={`${nextClient.name} · ${categoryById(next.specialty)?.name}`}
            meta={next.dateLabel}
            time="Video call"
            actionHref={routes.professionalBookings}
            actionLabel={t("sessions.join")}
            tone="gold"
          />
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{t("proHome.schedule")}</h2>
        <div className="mt-3 space-y-3">
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p>{t("proHome.emptySchedule")}</p>
              <div className="mt-3">
                <ButtonLink href={routes.professionalAvailability}>{t("proHome.availability")}</ButtonLink>
              </div>
            </div>
          ) : (
            upcoming.map((booking) => {
              const client = clients.find((item) => item.id === booking.clientId);
              return (
                <article key={booking.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
                  <div>
                    <p className="font-semibold">{client?.name}</p>
                    <p className="text-sm text-ink-2">
                      {categoryById(booking.specialty)?.name} · {booking.dateLabel}
                    </p>
                  </div>
                  <span className="rounded-full bg-gold-tint px-3 py-1 text-sm text-gold">{t("sessions.upcoming")}</span>
                </article>
              );
            })
          )}
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
