"use client";

import { categoryById, routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { db, type DbBooking, type DbProfessional } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function ClientSessionsInner() {
  const { t } = useLocale();
  const search = useSearchParams();
  const { user, ready } = useSession();
  const initial = search.get("tab");
  const [tab, setTab] = useState(
    initial === "past" || initial === "cancelled" ? initial : "upcoming",
  );
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [pros, setPros] = useState<Record<string, DbProfessional>>({});

  useEffect(() => {
    if (!ready || !user.userId) return;
    void (async () => {
      const list = await db.bookings.listForClient(user.userId!);
      setBookings(list);
      const map: Record<string, DbProfessional> = {};
      for (const booking of list) {
        if (!map[booking.professionalId]) {
          const pro = await db.professionals.getById(booking.professionalId);
          if (pro) map[booking.professionalId] = pro;
        }
      }
      setPros(map);
    })();
  }, [ready, user.userId]);

  const items = useMemo(() => {
    return bookings.filter((booking) => {
      if (tab === "upcoming") return booking.status === "upcoming";
      if (tab === "cancelled") return booking.status === "cancelled";
      return booking.status === "completed";
    });
  }, [bookings, tab]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-ink">{t("sessions.title")}</h1>
      <div className="mt-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "upcoming", label: t("sessions.upcoming") },
            { id: "past", label: t("sessions.past") },
            { id: "cancelled", label: t("sessions.cancelled") },
          ]}
        />
      </div>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <EmptyState
            title={t("sessions.emptyTitle")}
            body={t("sessions.emptyBody")}
            actionHref={routes.professionals}
            actionLabel={t("home.ctaBrowse")}
          />
        ) : (
          items.map((booking) => {
            const professional = pros[booking.professionalId];
            return (
              <article key={booking.id} className="rounded-2xl border border-border bg-surface p-5">
                <p className="font-semibold">{professional?.name}</p>
                <p className="text-sm text-ink-2">{categoryById(booking.specialty)?.name}</p>
                <p className="mt-1 text-sm">{booking.dateLabel}</p>
                <div className="mt-3">
                  <ButtonLink href={routes.clientSessionDetail(booking.id)} variant="secondary">
                    {booking.linkState === "ready" ? t("sessions.join") : t("sessions.details")}
                  </ButtonLink>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ClientSessionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <ClientSessionsInner />
    </Suspense>
  );
}
