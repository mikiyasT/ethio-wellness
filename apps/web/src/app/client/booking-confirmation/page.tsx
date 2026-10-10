"use client";

import { categoryById, routes } from "@ethio-wellness/shared";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { pollBooking } from "@/lib/bookings-api";
import { db, formatFee, type DbBooking, type DbProfessional } from "@/lib/db";
import { usePublicApi } from "@/lib/public-api";
import {
  buildIcsCalendar,
  downloadIcs,
  formatBookerLocal,
} from "@/lib/guest-booking";
import { useLocale } from "@/lib/locale";
import { trackPixel } from "@/lib/pixel";
import { useSession } from "@/lib/session";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function BookingConfirmationInner() {
  const { t } = useLocale();
  const search = useSearchParams();
  const { role } = useSession();
  const bookingId = search.get("booking");
  const [booking, setBooking] = useState<DbBooking | null>(null);
  const [professional, setProfessional] = useState<DbProfessional | null>(null);
  const [dismissCta, setDismissCta] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    trackPixel("PageView");
    void (async () => {
      if (!bookingId) return;
      if (usePublicApi()) {
        setWaiting(true);
        const found = await pollBooking(bookingId);
        setWaiting(false);
        if (!found || found.booking.status === "held") return;
        if (found.booking.status === "cancelled") {
          setFailed(true);
          return;
        }
        setBooking(found.booking);
        setProfessional(found.professional);
        return;
      }
      const found = await db.bookings.getById(bookingId);
      if (!found) return;
      setBooking(found);
      setProfessional((await db.professionals.getById(found.professionalId)) ?? null);
    })();
  }, [bookingId]);

  if (failed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-ink-2">
        This payment did not confirm the booking. The time may already have been released.
      </div>
    );
  }

  if (!booking || !professional) {
    return (
      <div className="p-8 text-center text-ink-2">
        {waiting || !bookingId ? "Loading confirmation…" : "Waiting for Stripe to confirm your payment…"}
      </div>
    );
  }

  const whenLocal = formatBookerLocal(booking.slotAt);
  const isGuestBooking = Boolean(booking.guestEmail) && !booking.clientId;
  const registerHref = booking.guestEmail
    ? `${routes.register}?email=${encodeURIComponent(booking.guestEmail)}&name=${encodeURIComponent(
        [booking.guestFirstName, booking.guestLastName].filter(Boolean).join(" "),
      )}&next=${encodeURIComponent(routes.clientSessions)}`
    : routes.register;

  function onAddToCalendar() {
    const ics = buildIcsCalendar({
      title: `Ayzon session with ${professional!.name}`,
      description: `Session code ${booking!.sessionCode}. Confirmation sent to your email.`,
      startUtc: booking!.slotAt,
      durationMin: booking!.durationMin,
    });
    downloadIcs(`ayzon-${booking!.sessionCode}.ics`, ics);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-ink">{t("confirm.title")}</h1>
      <p className="mt-2 text-ink-2">{t("confirm.sub")}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-left">
        <div className="flex items-center gap-3">
          <Avatar
            initials={professional.initials}
            avatarClass={professional.avatarClass}
            photoUrl={professional.photoUrl}
            name={professional.name}
            size="lg"
            shape="rounded"
          />
          <div>
            <p className="text-xl font-semibold">{professional.name}</p>
            <p className="text-ink-2">{categoryById(booking.specialty)?.name}</p>
          </div>
        </div>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">When</dt>
            <dd className="font-medium text-ink">{whenLocal}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Duration</dt>
            <dd>{booking.durationMin} minutes</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Paid</dt>
            <dd className="font-semibold">{formatFee(booking.fee)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Session code</dt>
            <dd className="font-mono font-semibold tracking-wide">{booking.sessionCode}</dd>
          </div>
        </dl>
        <Button className="mt-5 w-full" variant="secondary" onClick={onAddToCalendar}>
          Add to calendar
        </Button>
      </div>

      {booking.guestEmail ? (
        <p className="mt-4 text-sm text-ink-2">
          We sent your confirmation to <span className="font-medium text-ink">{booking.guestEmail}</span>
          .
        </p>
      ) : null}

      {isGuestBooking ? (
        <p className="mt-3 text-sm text-ink-2">
          {t("confirm.joinHint")}{" "}
          <Link href={routes.join} className="font-semibold text-teal-accent hover:underline">
            {t("confirm.joinLink")}
          </Link>
        </p>
      ) : null}

      {isGuestBooking && !dismissCta ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface-warm p-5 text-left">
          <p className="font-semibold text-ink">Create a free account to see all your sessions in one place</p>
          <p className="mt-1 text-sm text-ink-2">Optional — your booking is already confirmed.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <ButtonLink href={registerHref} className="flex-1">
              Create free account
            </ButtonLink>
            <Button variant="text" onClick={() => setDismissCta(true)}>
              Not now
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {role === "client" ? (
          <ButtonLink href={routes.clientSessions}>{t("confirm.view")}</ButtonLink>
        ) : (
          <ButtonLink href={routes.professionals}>{t("confirm.browse")}</ButtonLink>
        )}
        <ButtonLink href={routes.home} variant="secondary">
          {t("confirm.home")}
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
