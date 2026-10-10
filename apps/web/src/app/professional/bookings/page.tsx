"use client";

import { categoryById } from "@ethio-wellness/shared";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { fetchProfessionalBookings } from "@/lib/bookings-api";
import { db, type DbBooking, type DbUser } from "@/lib/db";
import { usePublicApi } from "@/lib/public-api";
import { formatProviderEat, guestDisplayName, guestFirstName } from "@/lib/guest-booking";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useEffect, useMemo, useState } from "react";

function bookingLabel(booking: DbBooking, clientsById: Record<string, DbUser>) {
  if (booking.guestFirstName || booking.guestEmail) {
    return guestDisplayName(booking.guestFirstName ?? "Guest", booking.guestLastName);
  }
  if (booking.clientId && clientsById[booking.clientId]) {
    return clientsById[booking.clientId]!.name;
  }
  return "Client";
}

export default function ProfessionalBookingsPage() {
  const { t } = useLocale();
  const { user, ready } = useSession();
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [clientsById, setClientsById] = useState<Record<string, DbUser>>({});

  useEffect(() => {
    if (!ready || !user.userId) return;
    void (async () => {
      if (usePublicApi()) {
        setBookings(await fetchProfessionalBookings());
        return;
      }
      const pro =
        (user.professionalId ? await db.professionals.getById(user.professionalId) : undefined) ??
        (await db.professionals.getByUserId(user.userId!));
      if (!pro) return;
      const list = await db.bookings.listForProfessional(pro.id);
      setBookings(list);
      const map: Record<string, DbUser> = {};
      for (const booking of list) {
        if (booking.clientId && !map[booking.clientId]) {
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
          items.map((booking) => {
            const isGuest = Boolean(booking.guestEmail) && !booking.clientId;
            return (
              <article key={booking.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{bookingLabel(booking, clientsById)}</p>
                  {isGuest ? (
                    <span className="rounded-full border border-border bg-surface-warm px-2 py-0.5 text-xs font-medium text-ink-2">
                      Guest
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-ink-2">{categoryById(booking.specialty)?.name}</p>
                <p className="mt-1 text-sm">{formatProviderEat(booking.slotAt)}</p>
                <p className="mt-1 font-mono text-xs text-ink-3">{booking.sessionCode}</p>
                {isGuest ? (
                  <p className="mt-1 text-xs text-ink-3">
                    {guestFirstName(booking)}
                    {booking.guestEmail ? ` · ${booking.guestEmail}` : ""}
                  </p>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
