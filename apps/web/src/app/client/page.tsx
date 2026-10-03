"use client";

import { categoryById, routes, type Professional } from "@ethio-wellness/shared";
import { CategoryCard } from "@/components/domain/category-card";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { SessionCard } from "@/components/domain/session-card";
import { ButtonLink } from "@/components/ui/button";
import { db, toCardProfessional, type DbBooking } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useEffect, useState } from "react";

export default function ClientHomePage() {
  const { t } = useLocale();
  const { user, ready } = useSession();
  const [next, setNext] = useState<DbBooking | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [recommended, setRecommended] = useState<Professional[]>([]);
  const shortcuts = ["individual-mental-health", "grief-and-loss", "career-and-life-stress", "youth-and-students"] as const;

  useEffect(() => {
    if (!ready || !user.userId) return;
    void (async () => {
      const bookings = await db.bookings.listForClient(user.userId!);
      const upcoming = bookings.find((booking) => booking.status === "upcoming") ?? null;
      setNext(upcoming);
      if (upcoming) {
        const pro = await db.professionals.getById(upcoming.professionalId);
        if (pro) setProfessional(toCardProfessional(pro));
      }
      const approved = await db.professionals.list({ status: "approved" });
      setRecommended(approved.slice(4, 6).map((pro) => toCardProfessional(pro)));
    })();
  }, [ready, user.userId]);

  return (
    <div>
      <h1 className="text-[32px] font-bold text-ink md:text-[40px]">
        {user.name ? `Selam, ${user.name} 👋` : t("clientHome.hello")}
      </h1>
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
          {recommended.map((item) => (
            <ProfessionalCard key={item.id} professional={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
