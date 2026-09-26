"use client";

import { bookingsForStatus, categoryById, professionalById, routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { useLocale } from "@/lib/locale";
import { useState } from "react";

export default function ClientSessionsPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState("upcoming");
  const items = bookingsForStatus(tab as "upcoming" | "past" | "cancelled");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
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
            actionLabel={t("home.ctaProfessionals")}
          />
        ) : (
          items.map((booking) => {
            const professional = professionalById(booking.professionalId);
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
