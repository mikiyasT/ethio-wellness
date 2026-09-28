"use client";

import { bookings, categoryById, professionalById, professionals, routes } from "@ethio-wellness/shared";
import { CategoryCard } from "@/components/domain/category-card";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { SessionCard } from "@/components/domain/session-card";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function ClientHomePage() {
  const { t } = useLocale();
  const next = bookings.find((booking) => booking.status === "upcoming");
  const professional = next ? professionalById(next.professionalId) : undefined;
  const shortcuts = ["individual-mental-health", "grief-and-loss", "career-and-life-stress", "youth-and-students"] as const;

  return (
    <div>
      <h1 className="text-[32px] font-bold text-ink md:text-[40px]">{t("clientHome.hello")}</h1>
      <p className="mt-2 text-ink-2">{t("clientHome.sub")}</p>

      {next && professional ? (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-3">{t("clientHome.next")}</p>
          <SessionCard
            initials={professional.initials}
            avatarClass={professional.avatarClass}
            title={`${professional.name} · ${categoryById(next.specialty)?.name}`}
            meta={next.dateLabel}
            time="Video call"
            actionHref={routes.clientSessionDetail(next.id)}
            actionLabel={t("sessions.join")}
          />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <p className="font-semibold">{t("clientHome.bookFirst")}</p>
          <div className="mt-3">
            <ButtonLink href={routes.professionals}>{t("home.ctaProfessionals")}</ButtonLink>
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">{t("clientHome.continue")}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {shortcuts.map((id) => {
            const category = categoryById(id);
            return category ? <CategoryCard key={id} category={category} compact /> : null;
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">{t("clientHome.recommended")}</h2>
          <ButtonLink href={routes.professionals} variant="text">
            {t("clientHome.viewAll")}
          </ButtonLink>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {professionals.slice(4, 6).map((item) => (
            <ProfessionalCard key={item.id} professional={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
