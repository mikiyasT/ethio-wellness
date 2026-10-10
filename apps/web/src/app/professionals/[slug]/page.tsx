"use client";

import { LANGUAGES, categoryById, routes } from "@ethio-wellness/shared";
import { BookChoiceDialog } from "@/components/domain/book-choice-dialog";
import { SlotChip } from "@/components/domain/slot-chip";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import {
  calendarCells,
  formatDayChip,
  formatMonthTitle,
  hasOpenSlots,
  hoursForDate,
  parseIsoDate,
  toIsoDate,
} from "@/lib/availability-editor";
import { bookPath } from "@/lib/booking";
import { createHold } from "@/lib/bookings-api";
import { db, formatFee, toCardProfessional, type DbProfessional, type DbSlot } from "@/lib/db";
import { fetchOpenSlots, fetchProfessionalBySlug, usePublicApi } from "@/lib/public-api";
import { useLocale } from "@/lib/locale";
import { trackPixel } from "@/lib/pixel";
import { useSession } from "@/lib/session";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProfessionalDetailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { role, user } = useSession();
  const params = useParams<{ slug: string }>();
  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  const [dbPro, setDbPro] = useState<DbProfessional | null | undefined>(undefined);
  const [slots, setSlots] = useState<DbSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [choiceOpen, setChoiceOpen] = useState(false);

  useEffect(() => {
    trackPixel("PageView");
    void (async () => {
      await db.bookings.releaseExpiredHolds();
      const found = usePublicApi()
        ? await fetchProfessionalBySlug(params.slug)
        : await db.professionals.getBySlug(params.slug);
      if (!found || found.status !== "approved") {
        setDbPro(null);
        return;
      }
      setDbPro(found);
      const list = usePublicApi()
        ? await fetchOpenSlots(found.slug, found.id)
        : await db.slots.listForProfessional(found.id);
      setSlots(list);
      const firstOpen =
        list.find((slot) => slot.status === "open" && slot.dateIso >= todayIso)?.dateIso ?? todayIso;
      setSelectedDate(firstOpen);
      const d = parseIsoDate(firstOpen);
      setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
      const firstOpenSlot = list.find(
        (slot) => slot.status === "open" && slot.dateIso === firstOpen,
      );
      setSelected(firstOpenSlot?.id ?? "");
    })();
  }, [params.slug, todayIso]);

  const professional = useMemo(
    () => (dbPro ? toCardProfessional(dbPro) : null),
    [dbPro],
  );

  const dayOpenSlots = useMemo(() => {
    if (!dbPro) return [];
    return hoursForDate(selectedDate, slots, dbPro.id).filter((slot) => slot.status === "open");
  }, [dbPro, selectedDate, slots]);

  const cells = useMemo(
    () => calendarCells(viewMonth.year, viewMonth.month),
    [viewMonth.year, viewMonth.month],
  );
  const hasAnyOpen = useMemo(
    () => slots.some((slot) => slot.status === "open" && slot.dateIso >= todayIso),
    [slots, todayIso],
  );

  useEffect(() => {
    if (dayOpenSlots.length === 0) {
      setSelected("");
      return;
    }
    if (!dayOpenSlots.some((slot) => slot.id === selected)) {
      setSelected(dayOpenSlots[0]!.id);
    }
  }, [dayOpenSlots, selected]);

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

  const selectedSlot = slots.find((slot) => slot.id === selected && slot.status === "open");
  const bookNextHref = selectedSlot ? bookPath(professional.slug, selectedSlot.id) : routes.clientBook;

  function selectDate(iso: string) {
    if (iso < todayIso) return;
    setSelectedDate(iso);
    setError("");
    const d = parseIsoDate(iso);
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
  }

  function shiftMonth(delta: number) {
    setViewMonth((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  async function reloadSlots() {
    if (!dbPro) return;
    const list = usePublicApi()
      ? await fetchOpenSlots(dbPro.slug, dbPro.id)
      : await db.slots.listForProfessional(dbPro.id);
    setSlots(list);
  }

  async function startHoldAndBook() {
    if (!selectedSlot || !dbPro || !professional || selectedSlot.status !== "open") return;
    setBusy(true);
    setError("");
    try {
      const hold = usePublicApi()
        ? await createHold(selectedSlot.id)
        : await db.bookings.createHold({
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
      await reloadSlots();
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

      {!hasAnyOpen ? (
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
          <section className="rounded-xl border border-border bg-bg/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink hover:bg-surface-warm"
              >
                <ChevronLeft size={18} />
              </button>
              <h3 className="text-sm font-semibold text-ink">
                {formatMonthTitle(new Date(viewMonth.year, viewMonth.month, 1))}
              </h3>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink hover:bg-surface-warm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-ink-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((iso, index) => {
                if (!iso) return <div key={`pad-${index}`} />;
                const isPast = iso < todayIso;
                const isSelected = iso === selectedDate;
                const isToday = iso === todayIso;
                const dayHasOpen = hasOpenSlots(hoursForDate(iso, slots, dbPro.id));
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isPast}
                    onClick={() => selectDate(iso)}
                    className={[
                      "relative flex min-h-10 flex-col items-center justify-center rounded-xl text-sm",
                      isPast && "cursor-not-allowed text-ink-3 opacity-40",
                      !isPast && !isSelected && "text-ink hover:bg-primary-tint",
                      isSelected && "bg-primary font-semibold text-on-primary",
                      !isSelected && isToday && "ring-1 ring-primary",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {parseIsoDate(iso).getDate()}
                    {dayHasOpen ? (
                      <span
                        className={`mt-0.5 h-1 w-1 rounded-full ${isSelected ? "bg-on-primary" : "bg-primary"}`}
                      />
                    ) : (
                      <span className="mt-0.5 h-1 w-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <div>
            <p className="text-sm font-medium text-ink">
              {t("detail.slotsFor")} {formatDayChip(selectedDate)}
            </p>
            {dayOpenSlots.length === 0 ? (
              <p className="mt-3 text-sm text-ink-2">{t("detail.noSlotsDay")}</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {dayOpenSlots.map((slot) => (
                  <SlotChip
                    key={slot.id}
                    label={slot.timeLabel}
                    status="open"
                    selected={selected === slot.id}
                    onClick={() => setSelected(slot.id)}
                  />
                ))}
              </div>
            )}
          </div>

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
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <Link href={routes.professionals} className="text-sm text-teal-accent hover:underline">
        ← {t("detail.back")}
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-start gap-4">
            <Avatar
              initials={professional.initials}
              avatarClass={professional.avatarClass}
              photoUrl={professional.photoUrl}
              name={professional.name}
              size="lg"
              shape="rounded"
            />
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
