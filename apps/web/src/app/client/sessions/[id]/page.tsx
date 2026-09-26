"use client";

import { bookings, categoryById, professionalById } from "@ethio-wellness/shared";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/lib/locale";
import { useParams } from "next/navigation";

export default function ClientSessionDetailPage() {
  const { t } = useLocale();
  const params = useParams<{ id: string }>();
  const booking = bookings.find((item) => item.id === params.id);
  const professional = booking ? professionalById(booking.professionalId) : undefined;

  if (!booking || !professional) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState title={t("notFound.title")} body={t("notFound.body")} actionHref="/client/sessions" actionLabel={t("sessions.title")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("sessions.details")}</h1>
      <dl className="mt-6 space-y-3 rounded-2xl border border-border bg-surface p-6">
        <div>
          <dt className="text-sm text-ink-3">{t("session.professional")}</dt>
          <dd className="font-medium">{professional.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.datetime")}</dt>
          <dd>{booking.dateLabel}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.specialty")}</dt>
          <dd>{categoryById(booking.specialty)?.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.duration")}</dt>
          <dd>1 hour</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.status")}</dt>
          <dd className="capitalize">{booking.status}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-ink-3">{t("session.joinNote")}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Button disabled={booking.linkState !== "ready"}>{t("sessions.join")}</Button>
        <Button variant="secondary">{t("session.reschedule")}</Button>
        <Button variant="danger">{t("session.cancel")}</Button>
      </div>
    </div>
  );
}
