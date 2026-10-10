"use client";

import { routes, type SlotStatus } from "@ethio-wellness/shared";
import { SlotChip } from "@/components/domain/slot-chip";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  calendarCells,
  eatDateAndHour,
  eatTodayIso,
  formatDayChip,
  formatMonthTitle,
  hasOpenSlots,
  hoursForDate,
  loadSlotsForProfessional,
  parseIsoDate,
  serializeSlots,
  toIsoDate,
  upsertLocalSlot,
} from "@/lib/availability-editor";
import type { DbSlot } from "@/lib/db";
import { db } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { fetchMyAvailability, saveMyAvailability, type MySlot } from "@/lib/pro-api";
import { defaultProfessionalStatus } from "@/lib/pro-approval";
import { usePublicApi } from "@/lib/public-api";
import { useSession } from "@/lib/session";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type BookedSlotMeta = {
  clientFirstName: string;
  payoutLabel: string;
};

function AvailabilityInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { setSession, user, ready, refresh } = useSession();
  const fromOnboarding = search.get("from") === "onboarding";

  const todayIso = useMemo(() => (usePublicApi() ? eatTodayIso() : toIsoDate(new Date())), []);
  const [proId, setProId] = useState<string | null>(null);
  const [slots, setSlots] = useState<DbSlot[]>([]);
  const [baselineSlots, setBaselineSlots] = useState<DbSlot[]>([]);
  const [bookedMetaBySlotId, setBookedMetaBySlotId] = useState<Record<string, BookedSlotMeta>>({});
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [savedMsg, setSavedMsg] = useState(false);
  const [info, setInfo] = useState("");
  const [confirmCloseDay, setConfirmCloseDay] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<DbSlot | null>(null);

  async function loadBookedMeta(professionalId: string, proSlots: DbSlot[]) {
    const bookings = await db.bookings.listForProfessional(professionalId);
    const meta: Record<string, BookedSlotMeta> = {};
    for (const booking of bookings) {
      if (booking.status === "cancelled") continue;
      const slot =
        proSlots.find((item) => item.id === booking.slotId) ??
        proSlots.find(
          (item) =>
            item.status === "booked" &&
            booking.dateLabel.toLowerCase().includes(item.timeLabel.toLowerCase().split(" ")[0] ?? ""),
        );
      if (!slot || slot.status !== "booked") continue;
      let firstName = "Client";
      if (booking.guestFirstName) {
        firstName = booking.guestFirstName;
      } else if (booking.clientId) {
        const client = await db.users.getById(booking.clientId);
        firstName = (client?.name ?? "Client").trim().split(/\s+/)[0] || "Client";
      }
      meta[slot.id] = {
        clientFirstName: firstName,
        payoutLabel: `+$${booking.fee}`,
      };
    }
    // Fallback for booked slots without a matched booking row
    for (const slot of proSlots.filter((item) => item.status === "booked")) {
      if (meta[slot.id]) continue;
      meta[slot.id] = {
        clientFirstName: "Client",
        payoutLabel: "+$25",
      };
    }
    setBookedMetaBySlotId(meta);
  }

  useEffect(() => {
    if (!ready || !user.userId) return;
    void (async () => {
      if (usePublicApi()) {
        if (!user.professionalId) return;
        setProId(user.professionalId);
        const loaded = (await fetchMyAvailability()).map((slot) => slotInEat(slot, user.professionalId!));
        setSlots(loaded);
        setBaselineSlots(loaded);
        await loadBookedMeta(user.professionalId, loaded);
        const firstOpen = loaded.find((slot) => slot.status === "open" && slot.dateIso >= todayIso)?.dateIso;
        const start = firstOpen ?? todayIso;
        setSelectedDate(start);
        const d = parseIsoDate(start);
        setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
        return;
      }
      const pro =
        (user.professionalId ? await db.professionals.getById(user.professionalId) : undefined) ??
        (await db.professionals.getByUserId(user.userId!));
      if (!pro) return;
      setProId(pro.id);
      const loaded = await loadSlotsForProfessional(pro.id);
      setSlots(loaded);
      setBaselineSlots(loaded);
      await loadBookedMeta(pro.id, loaded);
      const firstOpen = loaded.find((slot) => slot.status === "open" && slot.dateIso >= todayIso)?.dateIso;
      const start = firstOpen ?? todayIso;
      setSelectedDate(start);
      const d = parseIsoDate(start);
      setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
    })();
  }, [ready, user.userId, user.professionalId, todayIso]);

  const daySlots = useMemo(
    () => (proId ? hoursForDate(selectedDate, slots, proId) : []),
    [selectedDate, slots, proId],
  );
  const openCount = daySlots.filter((slot) => slot.status === "open").length;
  const bookedCount = daySlots.filter((slot) => slot.status === "booked").length;
  const showEmptyHint = openCount === 0 && bookedCount === 0;
  const cells = calendarCells(viewMonth.year, viewMonth.month);
  const dirty = serializeSlots(slots) !== serializeSlots(baselineSlots);

  function selectDate(iso: string) {
    if (iso < todayIso) return;
    setSelectedDate(iso);
    setSavedMsg(false);
    setInfo("");
    setConfirmCloseDay(false);
    const d = parseIsoDate(iso);
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
  }

  function applySlotStatus(slot: DbSlot, nextStatus: SlotStatus) {
    if (!proId) return;
    const next: DbSlot = {
      ...slot,
      status: nextStatus,
      dayLabel: formatDayChip(selectedDate),
      dateIso: selectedDate,
      professionalId: proId,
    };
    setSlots((current) => upsertLocalSlot(current, next));
    setSavedMsg(false);
    setInfo("");
    setConfirmCloseDay(false);
  }

  function toggle(slot: DbSlot) {
    if (slot.status === "booked" || slot.status === "held" || !proId) return;
    // Opening a closed slot stays one-tap.
    if (slot.status !== "open") {
      applySlotStatus(slot, "open");
      return;
    }
    const baseline = baselineSlots.find(
      (item) => item.dateIso === slot.dateIso && item.timeLabel === slot.timeLabel,
    );
    // Unsaved "Make available" — cancel with one tap (nothing persisted yet).
    if (baseline?.status !== "open") {
      applySlotStatus(slot, "closed");
      return;
    }
    // Saved Available requires confirmation before marking for removal.
    setPendingRemove(slot);
  }

  function confirmRemoveAvailability() {
    if (!pendingRemove) return;
    applySlotStatus(pendingRemove, "closed");
    setPendingRemove(null);
  }

  function shiftMonth(delta: number) {
    setViewMonth((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  async function performSave() {
    if (!proId || !user.userId) return;
    if (usePublicApi()) {
      const hours = slots
        .filter((slot) => slot.status === "open")
        .map((slot) => ({ date: slot.dateIso, time: slot.timeLabel }));
      const loaded = (await saveMyAvailability(hours)).map((slot) => slotInEat(slot, proId));
      setSlots(loaded);
      setBaselineSlots(loaded);
      await loadBookedMeta(proId, loaded);
      setSavedMsg(true);
      setInfo("");
      setConfirmCloseDay(false);
      if (fromOnboarding) router.push(routes.professionalPending);
      return;
    }
    const compact = slots.filter((slot) => slot.status === "open" || slot.status === "booked");
    const existing = await loadSlotsForProfessional(proId);
    const booked = existing.filter((slot) => slot.status === "booked");
    const bookedKeys = new Set(booked.map((slot) => `${slot.dateIso}|${slot.timeLabel}`));
    const next = [
      ...booked,
      ...compact.filter(
        (slot) => slot.status === "open" && !bookedKeys.has(`${slot.dateIso}|${slot.timeLabel}`),
      ),
    ];
    await replaceProfessionalSlots(proId, next);

    const reloaded = await loadSlotsForProfessional(proId);
    setSlots(reloaded);
    setBaselineSlots(reloaded);
    await loadBookedMeta(proId, reloaded);
    setSavedMsg(true);
    setInfo("");
    setConfirmCloseDay(false);

    if (fromOnboarding) {
      const status = defaultProfessionalStatus();
      await db.professionals.update(proId, { status });
      setSession({
        ...user,
        role: "professional",
        professionalId: proId,
        professionalStatus: status,
      });
      await refresh();
      // TEMP: auto-approve skips /professional/pending
      router.push(status === "approved" ? routes.professionalHome : routes.professionalPending);
    }
  }

  function onSave() {
    if (!dirty) {
      setInfo(t("proAvail.noChanges"));
      setSavedMsg(false);
      return;
    }
    const hadOpenBefore = hasOpenSlots(hoursForDate(selectedDate, baselineSlots, proId ?? ""));
    if (openCount === 0 && hadOpenBefore && !confirmCloseDay) {
      setConfirmCloseDay(true);
      setInfo(t("proAvail.closeDayConfirm"));
      return;
    }
    void performSave();
  }

  if (!proId) {
    return <div className="p-8 text-ink-2">Loading availability…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      {fromOnboarding ? (
        <p className="text-sm font-medium text-ink-2">
          {t("proOnboard.stepAbout")}
          {" · "}
          {t("proOnboard.stepSpecialties")}
          {" · "}
          <span className="text-teal-accent">{t("proOnboard.stepAvailability")}</span>
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-bold text-ink">{t("proAvail.title")}</h1>
      <p className="mt-2 text-ink-2">{t("proAvail.sub")}</p>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink hover:bg-surface-warm"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-ink">
            {formatMonthTitle(new Date(viewMonth.year, viewMonth.month, 1))}
          </h2>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink hover:bg-surface-warm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-3">
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
            const dayHasOpen = hasOpenSlots(hoursForDate(iso, slots, proId));
            return (
              <button
                key={iso}
                type="button"
                disabled={isPast}
                onClick={() => selectDate(iso)}
                className={[
                  "relative flex min-h-11 flex-col items-center justify-center rounded-xl text-sm",
                  isPast && "cursor-not-allowed text-ink-3 opacity-40",
                  !isPast && !isSelected && "text-ink hover:bg-avail-tint",
                  isSelected && "bg-avail font-semibold text-white",
                  !isSelected && isToday && "ring-1 ring-avail",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {parseIsoDate(iso).getDate()}
                {dayHasOpen ? (
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-avail"}`}
                  />
                ) : (
                  <span className="mt-0.5 h-1 w-1" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <p className="mt-4 text-sm font-medium text-ink">
        {t("proAvail.slotsFor")} {formatDayChip(selectedDate)}
      </p>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-border bg-surface" /> {t("proAvail.available")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: "linear-gradient(135deg, var(--booked-from) 0%, var(--booked-to) 100%)" }}
          />{" "}
          {t("proAvail.booked")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-avail" /> {t("proAvail.selected")}
        </span>
      </div>

      {showEmptyHint ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface-warm px-5 py-6 text-center">
          <p className="font-semibold text-ink">{t("proAvail.emptyTitle")}</p>
          <p className="mt-2 text-sm text-ink-2">{t("proAvail.emptyBody")}</p>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-4 items-stretch gap-1.5 sm:grid-cols-6">
        {daySlots.map((slot) => {
          const bookedMeta = slot.status === "booked" ? bookedMetaBySlotId[slot.id] : undefined;
          const baseline = baselineSlots.find(
            (item) => item.dateIso === slot.dateIso && item.timeLabel === slot.timeLabel,
          );
          const pendingOpen = slot.status === "open" && baseline?.status !== "open";
          const pendingRemoveSlot =
            slot.status === "closed" && baseline?.status === "open";
          return (
            <SlotChip
              key={slot.id}
              size="sm"
              label={slot.timeLabel}
              sublabel={
                pendingRemoveSlot
                  ? t("proAvail.removeLabel")
                  : slot.status === "open"
                    ? pendingOpen
                      ? t("proAvail.makeAvailable")
                      : t("proAvail.openLabel")
                    : undefined
              }
              status={slot.status}
              selected={slot.status === "open"}
              pending={pendingOpen}
              pendingRemove={pendingRemoveSlot}
              onClick={
                slot.status === "booked" || slot.status === "held"
                  ? undefined
                  : () => toggle(slot)
              }
              bookedClientFirstName={
                slot.status === "booked" ? (bookedMeta?.clientFirstName ?? "Client") : undefined
              }
              bookedPayout={slot.status === "booked" ? (bookedMeta?.payoutLabel ?? "+$25") : undefined}
            />
          );
        })}
      </div>

      {dirty ? (
        <div className="mt-6">
          <Alert tone="info" icon={<Save className="h-4 w-4" aria-hidden />}>
            {t("proAvail.note")}
          </Alert>
        </div>
      ) : null}
      {info ? (
        <div className="mt-4">
          <Alert tone={confirmCloseDay ? "warning" : "info"}>{info}</Alert>
        </div>
      ) : null}
      {savedMsg && !fromOnboarding ? (
        <div className="mt-4">
          <Alert tone="success">{t("proAvail.saved")}</Alert>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {confirmCloseDay ? (
          <>
            <Button onClick={() => void performSave()}>{t("proAvail.confirmClose")}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmCloseDay(false);
                setInfo("");
              }}
            >
              {t("proAvail.keepEditing")}
            </Button>
          </>
        ) : (
          <Button onClick={onSave}>{t("proAvail.save")}</Button>
        )}
        {!fromOnboarding ? (
          <ButtonLink href={routes.professionalHome} variant="secondary">
            {t("nav.home")}
          </ButtonLink>
        ) : null}
      </div>

      {pendingRemove ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-slot-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-surface p-7 shadow-xl">
            <h2 id="remove-slot-title" className="text-2xl font-semibold text-ink">
              {t("proAvail.removeTitle")}
            </h2>
            <p className="mt-3 leading-6 text-ink-2">
              {t("proAvail.removeBody").replace("{time}", pendingRemove.timeLabel)}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <Button variant="danger" onClick={confirmRemoveAvailability} className="sm:flex-1">
                {t("proAvail.removeConfirm")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPendingRemove(null)}
                className="sm:flex-1"
              >
                {t("proAvail.keepAvailable")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function slotInEat(slot: MySlot, professionalId: string): DbSlot {
  const { dateIso, timeLabel } = eatDateAndHour(new Date(slot.startsAt));
  const status = slot.status === "held" ? "held" : slot.status === "booked" ? "booked" : "open";
  return {
    id: slot.id,
    professionalId,
    dateIso,
    dayLabel: formatDayChip(dateIso),
    timeLabel,
    status,
  };
}

async function replaceProfessionalSlots(professionalId: string, next: DbSlot[]) {
  await db.slots.replaceForProfessional(professionalId, next);
}

export default function ProfessionalAvailabilityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <AvailabilityInner />
    </Suspense>
  );
}
