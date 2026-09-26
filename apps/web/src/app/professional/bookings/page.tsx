"use client";

import { bookingsForStatus, categoryById, clients } from "@ethio-wellness/shared";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { useLocale } from "@/lib/locale";
import { useState } from "react";

export default function ProfessionalBookingsPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState("upcoming");
  const items = bookingsForStatus(tab as "upcoming" | "past" | "cancelled");

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
              <p className="font-semibold">{clients.find((client) => client.id === booking.clientId)?.name}</p>
              <p className="text-sm text-ink-2">{categoryById(booking.specialty)?.name}</p>
              <p className="mt-1 text-sm">{booking.dateLabel}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
