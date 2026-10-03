"use client";

import { categoryById } from "@ethio-wellness/shared";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { db, type DbBooking, type DbUser } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useEffect, useMemo, useState } from "react";

export default function ProfessionalBookingsPage() {
  const { t } = useLocale();
  const { user, ready } = useSession();
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [clientsById, setClientsById] = useState<Record<string, DbUser>>({});

  useEffect(() => {
    if (!ready || !user.userId) return;
    void (async () => {
      const pro =
        (user.professionalId ? await db.professionals.getById(user.professionalId) : undefined) ??
        (await db.professionals.getByUserId(user.userId!));
      if (!pro) return;
      const list = await db.bookings.listForProfessional(pro.id);
      setBookings(list);
      const map: Record<string, DbUser> = {};
      for (const booking of list) {
        if (!map[booking.clientId]) {
          const client = await db.users.getById(booking.clientId);
          if (client) map[booking.clientId] = client;
        }
      }
      setClientsById(map);
    })();
  }, [ready, user.userId, user.professionalId]);

  const items = useMemo(() => {
    return bookings.filter((booking) => {
      if (tab === "upcoming") return booking.status === "upcoming";
      if (tab === "cancelled") return booking.status === "cancelled";
      return booking.status === "completed";
    });
  }, [bookings, tab]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("proBookings.title")}</h1>
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
          <EmptyState title="No bookings yet" body="When clients book you, they will appear here." />
        ) : (
          items.map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold">{clientsById[booking.clientId]?.name}</p>
              <p className="text-sm text-ink-2">{categoryById(booking.specialty)?.name}</p>
              <p className="mt-1 text-sm">{booking.dateLabel}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
