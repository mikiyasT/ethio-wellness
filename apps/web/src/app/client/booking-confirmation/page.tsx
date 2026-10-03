"use client";

import { categoryById, routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { db, formatFee, type DbBooking, type DbProfessional } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function BookingConfirmationInner() {
  const { t } = useLocale();
  const search = useSearchParams();
  const bookingId = search.get("booking");
  const [booking, setBooking] = useState<DbBooking | null>(null);
  const [professional, setProfessional] = useState<DbProfessional | null>(null);

  useEffect(() => {
    void (async () => {
      if (!bookingId) return;
      const found = await db.bookings.getById(bookingId);
      if (!found) return;
      setBooking(found);
      setProfessional((await db.professionals.getById(found.professionalId)) ?? null);
    })();
  }, [bookingId]);

  if (!booking || !professional) {
    return <div className="p-8 text-center text-ink-2">Loading confirmation…</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-ink">{t("confirm.title")}</h1>
      <p className="mt-2 text-ink-2">{t("confirm.sub")}</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-left">
        <p className="font-semibold">{professional.name}</p>
        <p className="text-ink-2">{categoryById(booking.specialty)?.name}</p>
        <p className="mt-2">{booking.dateLabel} EAT</p>
        <p>{t("book.duration")}</p>
        <p className="mt-2 font-medium">{formatFee(booking.fee)}</p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <ButtonLink href={routes.clientSessions}>{t("confirm.view")}</ButtonLink>
        <ButtonLink href={routes.clientHome} variant="secondary">
          {t("confirm.home")}
        </ButtonLink>
        <ButtonLink href={routes.professionals} variant="text">
          {t("confirm.browse")}
        </ButtonLink>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <BookingConfirmationInner />
    </Suspense>
  );
}
