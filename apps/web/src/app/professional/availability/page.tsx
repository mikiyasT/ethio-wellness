"use client";

import { routes, type AvailabilitySlot, type SlotStatus } from "@ethio-wellness/shared";
import { SlotChip } from "@/components/domain/slot-chip";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  addDays,
  calendarCells,
  dayChipRange,
  formatDayChip,
  formatMonthTitle,
  hasOpenSlots,
  hoursForDate,
  loadAvailabilityDraft,
  parseIsoDate,
  saveAvailabilityDraft,
  serializeSlots,
  toIsoDate,
  upsertSlot,
} from "@/lib/availability-editor";
import { submitProfessionalApplication } from "@/lib/professional-approval";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const PRO_ID = "pro-hana-tesfaye";

function AvailabilityInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { setSession, user } = useSession();
  const fromOnboarding = search.get("from") === "onboarding";

  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [baselineSlots, setBaselineSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [chipStart, setChipStart] = useState(todayIso);
  const [savedMsg, setSavedMsg] = useState(false);
  const [info, setInfo] = useState("");
  const [confirmCloseDay, setConfirmCloseDay] = useState(false);

  useEffect(() => {
    const loaded = loadAvailabilityDraft(PRO_ID);
    setSlots(loaded);
    setBaselineSlots(loaded);
    const firstOpen = loaded.find((slot) => slot.status === "open" && slot.date && slot.date >= todayIso)
      ?.date;
    const start = firstOpen ?? todayIso;
    setSelectedDate(start);
    setChipStart(start);
    const d = parseIsoDate(start);
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
  }, [todayIso]);

  const daySlots = useMemo(() => hoursForDate(selectedDate, slots, PRO_ID), [selectedDate, slots]);
  const openCount = daySlots.filter((slot) => slot.status === "open").length;
  const bookedCount = daySlots.filter((slot) => slot.status === "booked").length;
  const showEmptyHint = openCount === 0 && bookedCount === 0;
  const chips = dayChipRange(chipStart, 7);
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
    if (iso < chipStart || iso > addDays(chipStart, 6)) {
      setChipStart(iso);
    }
  }

  function toggle(slot: AvailabilitySlot) {
    if (slot.status === "booked") return;
    const nextStatus: SlotStatus = slot.status === "open" ? "closed" : "open";
    const next: AvailabilitySlot = {
      ...slot,
      status: nextStatus,
      dayLabel: formatDayChip(selectedDate),
      date: selectedDate,
    };
    setSlots((current) => upsertSlot(current, next));
    setSavedMsg(false);
    setInfo("");
    setConfirmCloseDay(false);
  }

  function shiftMonth(delta: number) {
    setViewMonth((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  async function performSave() {
    const compact = slots.filter((slot) => slot.status === "open" || slot.status === "booked");
    saveAvailabilityDraft(compact);
    setSlots(compact);
    setBaselineSlots(compact);
    setSavedMsg(true);
    setInfo("");
    setConfirmCloseDay(false);

    if (fromOnboarding) {
      await submitProfessionalApplication(user.email ?? "new-professional");
      setSession({
        ...user,
        role: "professional",
        professionalStatus: "pending",
      });
      router.push(routes.professionalPending);
    }
  }

  function onSave() {
    if (!dirty) {
      setInfo(t("proAvail.noChanges"));
      setSavedMsg(false);
      return;
    }

    const hadOpenBefore = hasOpenSlots(hoursForDate(selectedDate, baselineSlots, PRO_ID));
    if (openCount === 0 && hadOpenBefore && !confirmCloseDay) {
      setConfirmCloseDay(true);
      setInfo(t("proAvail.closeDayConfirm"));
      return;
    }

    void performSave();
  }

  return (
    <div className="mx-auto max-w-2xl">
      {fromOnboarding ? (
        <p className="text-sm font-medium text-ink-2">
          {t("proOnboard.stepAbout")}
          {" · "}
          {t("proOnboard.stepSpecialties")}
          {" · "}
          <span className="text-primary">{t("proOnboard.stepAvailability")}</span>
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
            const dayHasOpen = hasOpenSlots(hoursForDate(iso, slots, PRO_ID));
            return (
              <button
                key={iso}
                type="button"
                disabled={isPast}
                onClick={() => selectDate(iso)}
                className={[
                  "relative flex min-h-11 flex-col items-center justify-center rounded-xl text-sm",
                  isPast && "cursor-not-allowed text-ink-3 opacity-40",
                  !isPast && !isSelected && "text-ink hover:bg-primary-tint",
                  isSelected && "bg-primary font-semibold text-white",
                  !isSelected && isToday && "ring-1 ring-primary",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {parseIsoDate(iso).getDate()}
                {dayHasOpen ? (
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`}
                  />
                ) : (
                  <span className="mt-0.5 h-1 w-1" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Earlier days"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border"
          onClick={() => setChipStart(addDays(chipStart, -7))}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
          {chips.map((iso) => (
            <button
              key={iso}
              type="button"
              disabled={iso < todayIso}
              onClick={() => selectDate(iso)}
              className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm ${
                selectedDate === iso
                  ? "bg-primary text-white"
                  : iso < todayIso
                    ? "cursor-not-allowed border border-border text-ink-3 opacity-50"
                    : "border border-border bg-surface text-ink"
              }`}
            >
              {formatDayChip(iso)}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Later days"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border"
          onClick={() => setChipStart(addDays(chipStart, 7))}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <p className="mt-4 text-sm font-medium text-ink">
        {t("proAvail.slotsFor")} {formatDayChip(selectedDate)}
      </p>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-border bg-surface" /> {t("proAvail.available")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-ink-3" /> {t("proAvail.booked")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary" /> {t("proAvail.selected")}
        </span>
      </div>

      {showEmptyHint ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface-warm px-5 py-6 text-center">
          <p className="font-semibold text-ink">{t("proAvail.emptyTitle")}</p>
          <p className="mt-2 text-sm text-ink-2">{t("proAvail.emptyBody")}</p>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {daySlots.map((slot) => (
          <SlotChip
            key={slot.id}
            label={slot.timeLabel}
            sublabel={
              slot.status === "booked"
                ? t("proAvail.booked")
                : slot.status === "open"
                  ? t("proAvail.openLabel")
                  : undefined
            }
            status={slot.status}
            selected={slot.status === "open"}
            onClick={() => toggle(slot)}
          />
        ))}
      </div>

      <div className="mt-6">
        <Alert tone="warning">{t("proAvail.note")}</Alert>
      </div>
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
    </div>
  );
}

export default function ProfessionalAvailabilityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <AvailabilityInner />
    </Suspense>
  );
}
