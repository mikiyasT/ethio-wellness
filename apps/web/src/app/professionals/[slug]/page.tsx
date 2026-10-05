"use client";

import { LANGUAGES, categoryById, routes } from "@ethio-wellness/shared";
import { BookChoiceDialog } from "@/components/domain/book-choice-dialog";
import { SlotChip } from "@/components/domain/slot-chip";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { bookPath } from "@/lib/booking";
import { db, formatFee, toCardProfessional, type DbProfessional, type DbSlot } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { trackPixel } from "@/lib/pixel";
import { useSession } from "@/lib/session";
import { Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProfessionalDetailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { role, user } = useSession();
  const params = useParams<{ slug: string }>();
  const [dbPro, setDbPro] = useState<DbProfessional | null | undefined>(undefined);
  const [slots, setSlots] = useState<DbSlot[]>([]);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [choiceOpen, setChoiceOpen] = useState(false);

  useEffect(() => {
    trackPixel("PageView");
    void (async () => {
      await db.bookings.releaseExpiredHolds();
      const found = await db.professionals.getBySlug(params.slug);
      if (!found || found.status !== "approved") {
        setDbPro(null);
        return;
      }
      setDbPro(found);
      const list = await db.slots.listForProfessional(found.id);
      const visible = list.filter(
        (slot) => slot.status === "open" || slot.status === "booked" || slot.status === "held",
      );
      setSlots(visible);
      setSelected(visible.find((slot) => slot.status === "open")?.id ?? "");
    })();
  }, [params.slug]);

  const professional = useMemo(
    () => (dbPro ? toCardProfessional(dbPro) : null),
    [dbPro],
  );

  const grouped = useMemo(
    () =>
      slots.reduce<Record<string, DbSlot[]>>((acc, slot) => {
        acc[slot.dayLabel] ??= [];
        acc[slot.dayLabel].push(slot);
        return acc;
      }, {}),
    [slots],
  );

  if (dbPro === undefined) {
    return <div className="p-8 text-ink-2">Loading…</div>;
  }

  if (!professional || !dbPro) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title={t("notFound.title")}
          body={t("notFound.body")}
          actionHref={routes.professionals}
          actionLabel={t("notFound.cta")}
        />
      </div>
    );
  }

  const selectedSlot = slots.find((slot) => slot.id === selected);
  const bookNextHref = selectedSlot ? bookPath(professional.slug, selectedSlot.id) : routes.clientBook;

  async function startHoldAndBook() {
    if (!selectedSlot || !dbPro || !professional || selectedSlot.status !== "open") return;
    setBusy(true);
    setError("");
    try {
      const hold = await db.bookings.createHold({
        professionalId: dbPro.id,
        slotId: selectedSlot.id,
        clientId: role === "client" ? user.userId : undefined,
      });
      trackPixel("InitiateCheckout", { value: dbPro.fee, currency: "USD" });
      setChoiceOpen(false);
      router.push(`${bookPath(professional.slug, selectedSlot.id)}&hold=${hold.id}`);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not hold this slot. Try another time.");
      const list = await db.slots.listForProfessional(dbPro.id);
      setSlots(
        list.filter(
          (slot) => slot.status === "open" || slot.status === "booked" || slot.status === "held",
        ),
      );
    }
  }

  function onBook() {
    if (!selectedSlot || selectedSlot.status !== "open") return;
    setError("");
    if (role === "client") {
      void startHoldAndBook();
      return;
    }
    setChoiceOpen(true);
  }

  const bookingPanel = (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">{t("detail.availability")}</h2>
      <p className="mt-1 text-sm text-ink-3">{t("detail.hourNote")}</p>
      {slots.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title={t("detail.emptyTitle")}
            body={t("detail.emptyBody")}
            actionHref={routes.professionals}
            actionLabel={t("detail.browseSimilar")}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {Object.entries(grouped).map(([day, daySlots]) => (
            <div key={day}>
              <p className="mb-2 font-medium">{day}</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <SlotChip
                    key={slot.id}
                    label={slot.timeLabel}
                    status={slot.status}
                    selected={selected === slot.id}
                    onClick={() => slot.status === "open" && setSelected(slot.id)}
                  />
                ))}
              </div>
            </div>
          ))}
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <Button
            disabled={!selectedSlot || selectedSlot.status !== "open" || busy}
            onClick={onBook}
            block
          >
            {busy && role === "client" ? "Holding slot…" : t("detail.book")}
            {!(busy && role === "client") && selectedSlot ? ` · ${selectedSlot.timeLabel}` : ""}
          </Button>
          <p className="text-xs text-ink-3">{t("detail.guestNote")}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <Link href={routes.professionals} className="text-sm text-primary">
        ← {t("detail.back")}
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-start gap-4">
            <Avatar initials={professional.initials} avatarClass={professional.avatarClass} size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-ink">{professional.name}</h1>
              <p className="text-ink-2">
                {professional.title} · {professional.city}
              </p>
              <p className="mt-1 flex items-center gap-1 text-gold">
                <Star size={16} fill="currentColor" /> {professional.rating} ({professional.reviewCount})
              </p>
            </div>
          </div>
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">{t("detail.about")}</h2>
            <p className="mt-2 leading-7 text-ink-2">{professional.bio}</p>
          </section>
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">{t("detail.specialties")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {professional.specialties.map((id) => (
                <Tag key={id}>{categoryById(id)?.name ?? id}</Tag>
              ))}
            </div>
          </section>
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">{t("detail.languages")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {professional.languages.map((language) => {
                const item = LANGUAGES.find((entry) => entry.id === language);
                return (
                  <Tag key={language} eth={language === "amharic" || language === "tigrinya"}>
                    {item?.nativeLabel}
                  </Tag>
                );
              })}
            </div>
          </section>
          <dl className="mt-8 grid gap-3 rounded-2xl bg-surface-warm p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-sm text-ink-3">{t("session.duration")}</dt>
              <dd>1 hour</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-3">Format</dt>
              <dd>{t("detail.video")}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-3">Fee</dt>
              <dd>{formatFee(dbPro.fee)} / session</dd>
            </div>
          </dl>
          <div className="mt-8 lg:hidden">{bookingPanel}</div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24">{bookingPanel}</div>
        </aside>
      </div>
      <div className="mt-8">
        <ButtonLink href={routes.professionals} variant="outline">
          {t("detail.browseSimilar")}
        </ButtonLink>
      </div>
      {choiceOpen ? (
        <BookChoiceDialog
          nextHref={bookNextHref}
          busy={busy}
          onContinueAsGuest={() => void startHoldAndBook()}
          onClose={() => {
            if (!busy) setChoiceOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
