"use client";

import { bookings, categoryById, professionalById, routes } from "@ethio-wellness/shared";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientSessionDetailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const booking = bookings.find((item) => item.id === params.id);
  const professional = booking ? professionalById(booking.professionalId) : undefined;
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!booking || !professional) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          title={t("notFound.title")}
          body={t("notFound.body")}
          actionHref={routes.clientSessions}
          actionLabel={t("sessions.title")}
        />
      </div>
    );
  }

  const ready = booking.linkState === "ready";

  return (
    <div className="mx-auto max-w-xl">
      <Link href={routes.clientSessions} className="text-sm text-primary">
        {t("session.back")}
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-ink">{t("sessions.details")}</h1>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
        <Avatar initials={professional.initials} avatarClass={professional.avatarClass} />
        <div>
          <p className="font-semibold">{professional.name}</p>
          <p className="text-sm text-ink-2">
            {professional.title} · {professional.city}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-3 rounded-2xl border border-border bg-surface p-6">
        <div>
          <dt className="text-sm text-ink-3">{t("session.specialty")}</dt>
          <dd className="font-medium">{categoryById(booking.specialty)?.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.datetime")}</dt>
          <dd>{booking.dateLabel}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.duration")}</dt>
          <dd>1 hour</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.fee")}</dt>
          <dd>$25.00</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.format")}</dt>
          <dd>{t("detail.video")}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-3">{t("session.status")}</dt>
          <dd className="capitalize">{booking.status}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm text-ink-2">{ready ? t("session.videoReady") : t("session.videoPending")}</p>
        <div className="mt-3">
          <Button disabled={!ready} block>
            {t("sessions.join")}
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-border bg-surface p-5">
        <Button variant="secondary" disabled block>
          {t("session.reschedule")}
        </Button>
        <p className="text-sm text-ink-3">{t("session.rescheduleNote")}</p>
        {!confirmCancel ? (
          <button
            type="button"
            className="text-sm font-semibold text-error hover:underline"
            onClick={() => setConfirmCancel(true)}
          >
            {t("session.cancel")}
          </button>
        ) : (
          <div className="space-y-3">
            <Alert tone="warning">{t("session.cancelConfirm")}</Alert>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="danger"
                className="bg-error text-white hover:opacity-90"
                onClick={() => router.push(`${routes.clientSessions}?tab=cancelled`)}
              >
                {t("session.cancelYes")}
              </Button>
              <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
                {t("session.cancelKeep")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
