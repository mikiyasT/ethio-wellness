"use client";

import { categoryById, routes } from "@ethio-wellness/shared";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { db, formatFeeExact, type DbBooking, type DbProfessional } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientSessionDetailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, ready } = useSession();
  const [booking, setBooking] = useState<DbBooking | null | undefined>(undefined);
  const [professional, setProfessional] = useState<DbProfessional | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (!ready) return;
    void (async () => {
      const found = await db.bookings.getById(params.id);
      if (!found || (user.userId && found.clientId !== user.userId)) {
        setBooking(null);
        return;
      }
      setBooking(found);
      setProfessional((await db.professionals.getById(found.professionalId)) ?? null);
    })();
  }, [ready, params.id, user.userId]);

  if (booking === undefined) {
    return <div className="p-8 text-ink-2">Loading…</div>;
  }

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

  const readyLink = booking.linkState === "ready";

  async function onCancel() {
    await db.bookings.cancel(booking!.id, "client");
    router.push(`${routes.clientSessions}?tab=cancelled`);
  }

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
          <dd>{formatFeeExact(booking.fee)}</dd>
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
        <p className="text-sm text-ink-2">{readyLink ? t("session.videoReady") : t("session.videoPending")}</p>
        <div className="mt-3">
          <Button disabled={!readyLink} block>
            {t("sessions.join")}
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-border bg-surface p-5">
        <Button variant="secondary" disabled block>
          {t("session.reschedule")}
        </Button>
        <p className="text-sm text-ink-3">{t("session.rescheduleNote")}</p>
        {booking.status !== "cancelled" ? (
          !confirmCancel ? (
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
                  onClick={() => void onCancel()}
                >
                  {t("session.cancelYes")}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
                  {t("session.cancelKeep")}
                </Button>
              </div>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
