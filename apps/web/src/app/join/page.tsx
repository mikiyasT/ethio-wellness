"use client";

import { categoryById, routes } from "@ethio-wellness/shared";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { db, formatFee, type DbBooking, type DbProfessional } from "@/lib/db";
import {
  buildIcsCalendar,
  downloadIcs,
  formatBookerLocal,
  formatOpensIn,
  getJoinWindow,
  normalizeEmail,
  normalizeSessionCode,
} from "@/lib/guest-booking";
import { useLocale } from "@/lib/locale";
import { FormEvent, useEffect, useState } from "react";

export default function JoinRecoveryPage() {
  const { t } = useLocale();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<DbBooking | null>(null);
  const [professional, setProfessional] = useState<DbProfessional | null>(null);
  const [videoNote, setVideoNote] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!booking) return;
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, [booking]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setVideoNote(false);
    const sessionCode = normalizeSessionCode(code);
    const guestEmail = normalizeEmail(email);
    if (!sessionCode || !guestEmail) {
      setError(t("join.notFound"));
      return;
    }
    setLoading(true);
    try {
      const found = await db.bookings.findBySessionCodeAndEmail(sessionCode, guestEmail);
      if (!found) {
        setError(t("join.notFound"));
        setBooking(null);
        setProfessional(null);
        return;
      }
      if (found.status === "cancelled") {
        setError(t("join.cancelled"));
        setBooking(null);
        setProfessional(null);
        return;
      }
      const pro = (await db.professionals.getById(found.professionalId)) ?? null;
      setBooking(found);
      setProfessional(pro);
      setCode(found.sessionCode);
      setEmail(found.guestEmail ?? guestEmail);
    } finally {
      setLoading(false);
    }
  }

  function onAddToCalendar() {
    if (!booking || !professional) return;
    const ics = buildIcsCalendar({
      title: `Ayzon session with ${professional.name}`,
      description: `Session code ${booking.sessionCode}.`,
      startUtc: booking.slotAt,
      durationMin: booking.durationMin,
      url: typeof window !== "undefined" ? `${window.location.origin}${routes.join}` : undefined,
    });
    downloadIcs(`ayzon-${booking.sessionCode}.ics`, ics);
  }

  function resetLookup() {
    setBooking(null);
    setProfessional(null);
    setError("");
    setVideoNote(false);
  }

  if (booking && professional) {
    const windowState = getJoinWindow(booking.slotAt, now);
    const whenLocal = formatBookerLocal(booking.slotAt);
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm font-medium text-teal-accent">{t("join.lobbyTitle")}</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{professional.name}</h1>
        <p className="mt-2 text-ink-2">{t("join.lobbySub")}</p>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
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
              <p className="text-xl font-semibold text-ink">{professional.name}</p>
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

          <div className="mt-5 rounded-[10px] border border-border bg-surface-warm px-4 py-3 text-sm text-ink-2">
            {windowState.phase === "soon"
              ? t("join.opensIn").replace("{when}", formatOpensIn(windowState.opensInMs))
              : windowState.phase === "ended"
                ? t("join.ended")
                : t("join.ready")}
          </div>

          <Button
            className="mt-4 w-full"
            disabled={!windowState.canJoin}
            onClick={() => setVideoNote(true)}
          >
            {t("sessions.join")}
          </Button>
          {videoNote ? (
            <div className="mt-3">
              <Alert tone="info">{t("join.videoStub")}</Alert>
            </div>
          ) : null}
          <Button className="mt-3 w-full" variant="secondary" onClick={onAddToCalendar}>
            {t("join.addCalendar")}
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="text" onClick={resetLookup}>
            {t("join.another")}
          </Button>
          <ButtonLink href={routes.home} variant="secondary">
            {t("confirm.home")}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">{t("join.title")}</h1>
      <p className="mt-2 text-ink-2">{t("join.sub")}</p>

      <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4">
        {error ? <Alert tone="error">{error}</Alert> : null}
        <TextField
          label={t("join.code")}
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={t("join.codePlaceholder")}
          autoComplete="off"
          spellCheck={false}
          required
        />
        <TextField
          label={t("join.email")}
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "…" : t("join.submit")}
        </Button>
      </form>
    </div>
  );
}
