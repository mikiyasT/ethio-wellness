"use client";

import { categoryById, routes, type Professional } from "@ethio-wellness/shared";
import { CategoryCard } from "@/components/domain/category-card";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { SessionCard } from "@/components/domain/session-card";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { claimGuestBookings, fetchClaimable, fetchMyBookings } from "@/lib/bookings-api";
import { db, toCardProfessional, type DbBooking } from "@/lib/db";
import { fetchApprovedProfessionals, usePublicApi } from "@/lib/public-api";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useEffect, useState } from "react";

export default function ClientHomePage() {
  const { t } = useLocale();
  const { user, ready } = useSession();
  const [next, setNext] = useState<DbBooking | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [recommended, setRecommended] = useState<Professional[]>([]);
  const [claimable, setClaimable] = useState(0);
  const [claimNote, setClaimNote] = useState("");
  const shortcuts = ["individual-mental-health", "grief-and-loss", "career-and-life-stress", "youth-and-students"] as const;

  useEffect(() => {
    if (!ready || !user.userId) return;
    void (async () => {
      if (usePublicApi()) {
        const rows = await fetchMyBookings();
        const upcoming = rows.find((row) => row.booking.status === "upcoming") ?? null;
        setNext(upcoming?.booking ?? null);
        if (upcoming) setProfessional(toCardProfessional(upcoming.professional));
      } else {
        const bookings = await db.bookings.listForClient(user.userId!);
        const upcoming = bookings.find((booking) => booking.status === "upcoming") ?? null;
        setNext(upcoming);
        if (upcoming) {
          const pro = await db.professionals.getById(upcoming.professionalId);
          if (pro) setProfessional(toCardProfessional(pro));
        }
      }
      const approved = usePublicApi()
        ? await fetchApprovedProfessionals()
        : await db.professionals.list({ status: "approved" });
      setRecommended(approved.slice(4, 6).map((pro) => toCardProfessional(pro)));
      if (usePublicApi()) setClaimable(await fetchClaimable());
    })();
  }, [ready, user.userId]);

  async function onClaim() {
    const claimed = await claimGuestBookings();
    setClaimable(0);
    setClaimNote(claimed > 0 ? `Linked ${claimed} guest booking${claimed === 1 ? "" : "s"} to this account.` : "No guest bookings were waiting.");
    if (usePublicApi()) {
      const rows = await fetchMyBookings();
      const upcoming = rows.find((row) => row.booking.status === "upcoming") ?? null;
      setNext(upcoming?.booking ?? null);
      if (upcoming) setProfessional(toCardProfessional(upcoming.professional));
    }
  }

  return (
    <div>
      <h1 className="text-[32px] font-bold text-ink md:text-[40px]">
        {user.name ? `Selam, ${user.name} 👋` : t("clientHome.hello")}
      </h1>
      <p className="mt-2 text-ink-2">{t("clientHome.sub")}</p>

      {claimable > 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="font-semibold">Guest bookings use this email</p>
          <p className="mt-1 text-sm text-ink-2">
            {claimable} booking{claimable === 1 ? "" : "s"} made as a guest can be linked to this account.
          </p>
          <Button className="mt-3" onClick={() => void onClaim()}>
            Link them
          </Button>
        </div>
      ) : null}
      {claimNote ? (
        <div className="mt-4">
          <Alert tone="info">{claimNote}</Alert>
        </div>
      ) : null}

      {next && professional ? (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-3">{t("clientHome.next")}</p>
          <SessionCard
            initials={professional.initials}
            avatarClass={professional.avatarClass}
            photoUrl={professional.photoUrl}
            name={professional.name}
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
            <ButtonLink href={routes.professionals}>{t("home.ctaBrowse")}</ButtonLink>
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
