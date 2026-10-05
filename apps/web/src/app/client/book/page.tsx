"use client";

import { routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { TextAreaField, TextField } from "@/components/ui/field";
import { resolveBookingContext } from "@/lib/booking";
import { db, type DbBooking, type DbProfessional, type DbSlot } from "@/lib/db";
import { formatBookerLocal, SLOT_HOLD_MINUTES } from "@/lib/guest-booking";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

function ClientBookInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { role, user } = useSession();
  const proSlug = search.get("pro");
  const slotId = search.get("slot");
  const holdId = search.get("hold");
  const isGuest = role === "guest";

  const [professional, setProfessional] = useState<DbProfessional | null>(null);
  const [slot, setSlot] = useState<DbSlot | undefined>();
  const [hold, setHold] = useState<DbBooking | null>(null);
  const [specialtyName, setSpecialtyName] = useState("");
  const [fee, setFee] = useState("");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    void (async () => {
      await db.bookings.releaseExpiredHolds();
      const ctx = await resolveBookingContext(proSlug, slotId);
      setProfessional(ctx.professional);
      setSpecialtyName(ctx.specialtyName);
      setFee(ctx.fee);
      setSlot(ctx.slot);
      if (holdId) {
        const held = await db.bookings.getById(holdId);
        if (held && held.status === "held") {
          setHold(held);
          if (held.guestFirstName) setFirstName(held.guestFirstName);
          if (held.guestLastName) setLastName(held.guestLastName);
          if (held.guestEmail) setEmail(held.guestEmail);
          if (held.guestPhone) setPhone(held.guestPhone);
          if (held.guestNote) setNote(held.guestNote);
        } else {
          setError("Your 10-minute hold expired. Please pick the slot again.");
        }
      }
      if (role === "client" && user.name) {
        const parts = user.name.trim().split(/\s+/);
        setFirstName(parts[0] ?? "");
        setLastName(parts.slice(1).join(" "));
        setEmail(user.email ?? "");
      }
    })();
  }, [proSlug, slotId, holdId, role, user.name, user.email]);

  const whenLabel = hold?.slotAt
    ? formatBookerLocal(hold.slotAt)
    : slot
      ? `${slot.dayLabel}, ${slot.timeLabel}`
      : "TBD";

  async function onContinue(event: FormEvent) {
    event.preventDefault();
    if (!professional || !slot) return;
    setError("");

    try {
      let bookingId = hold?.id;
      if (!bookingId) {
        const created = await db.bookings.createHold({
          professionalId: professional.id,
          slotId: slot.id,
          clientId: role === "client" ? user.userId : undefined,
        });
        bookingId = created.id;
        setHold(created);
      }

      if (isGuest) {
        await db.bookings.updateHoldGuest(bookingId, {
          firstName,
          lastName,
          email,
          phone,
          note,
        });
      }

      const params = new URLSearchParams({
        pro: professional.slug,
        slot: slot.id,
        hold: bookingId,
      });
      router.push(`${routes.clientPayment}?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue. Please try again.");
    }
  }

  if (!professional) {
    return <div className="p-8 text-ink-2">Loading…</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">{t("book.title")}</h1>
      {isGuest ? (
        <p className="mt-2 text-ink-2">{t("book.guestSub")}</p>
      ) : null}
      <form className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]" onSubmit={(e) => void onContinue(e)}>
        <div className="space-y-6 rounded-2xl border border-border bg-surface p-6">
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Alert tone="info">
            Slot held for {SLOT_HOLD_MINUTES} minutes while you finish booking.
          </Alert>
          {isGuest ? (
            <section className="space-y-4">
              <h2 className="font-semibold">{t("book.guestTitle")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label={t("book.firstName")}
                  name="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <TextField
                  label={t("book.lastName")}
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <TextField
                label={t("book.email")}
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label={t("book.phone")}
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextAreaField
                label={t("book.note")}
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("book.notePlaceholder")}
              />
              <p className="text-xs text-ink-3">{t("book.privacy")}</p>
            </section>
          ) : (
            <section>
              <h2 className="font-semibold">{t("book.step1")}</h2>
              <p className="mt-2 text-ink-2">{whenLabel}</p>
            </section>
          )}
        </div>
        <aside className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <Avatar initials={professional.initials} avatarClass={professional.avatarClass} />
            <div>
              <p className="font-semibold">{professional.name}</p>
              <p className="text-sm text-ink-2">{specialtyName}</p>
            </div>
          </div>
          <p className="mt-4 text-sm">{whenLabel}</p>
          <p className="text-sm">{t("book.duration")}</p>
          <p className="mt-2 text-xl font-semibold">{fee}</p>
          <button
            type="submit"
            disabled={!slot || Boolean(error && !hold)}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-on-primary disabled:opacity-50"
          >
            {t("book.continue")}
          </button>
          <p className="mt-3 text-xs text-ink-3">{t("book.cancelNote")}</p>
        </aside>
      </form>
    </div>
  );
}

export default function ClientBookPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <ClientBookInner />
    </Suspense>
  );
}
