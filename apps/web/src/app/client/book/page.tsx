"use client";

import { routes, slotsForProfessional } from "@ethio-wellness/shared";
import { SlotChip } from "@/components/domain/slot-chip";
import { Avatar } from "@/components/ui/avatar";
import { resolveBookingContext } from "@/lib/booking";
import { useLocale } from "@/lib/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function ClientBookInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const proSlug = search.get("pro");
  const slotId = search.get("slot");
  const { professional, slot, specialtyName, fee } = useMemo(
    () => resolveBookingContext(proSlug, slotId),
    [proSlug, slotId],
  );
  const slots = slotsForProfessional(professional.id);
  const [selected, setSelected] = useState(slot?.id ?? "");
  const selectedSlot = slots.find((item) => item.id === selected) ?? slot;
  const dateLabel = selectedSlot ? `${selectedSlot.dayLabel}, ${selectedSlot.timeLabel}` : "TBD";

  function continuePayment() {
    const params = new URLSearchParams({
      pro: professional.slug,
      slot: selected || slot?.id || "",
    });
    router.push(`${routes.clientPayment}?${params.toString()}`);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">{t("book.title")}</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6 rounded-2xl border border-border bg-surface p-6">
          <section>
            <h2 className="font-semibold">{t("book.step1")}</h2>
            <p className="mt-2 rounded-full border border-border bg-primary-tint px-4 py-3 text-primary">
              {selectedSlot?.dayLabel ?? "Pick a slot"}
            </p>
          </section>
          <section>
            <h2 className="font-semibold">{t("book.step2")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((item) => (
                <SlotChip
                  key={item.id}
                  label={`${item.dayLabel} ${item.timeLabel}`}
                  status={item.status}
                  selected={selected === item.id}
                  onClick={() => item.status === "open" && setSelected(item.id)}
                />
              ))}
            </div>
          </section>
        </div>
        <aside className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <Avatar initials={professional.initials} avatarClass={professional.avatarClass} />
            <div>
              <p className="font-semibold">{professional.name}</p>
              <p className="text-sm text-ink-2">{specialtyName}</p>
            </div>
          </div>
          <p className="mt-4 text-sm">{dateLabel}</p>
          <p className="text-sm">{t("book.duration")}</p>
          <p className="mt-2 text-xl font-semibold">{fee}</p>
          <button
            type="button"
            disabled={!selectedSlot || selectedSlot.status !== "open"}
            onClick={continuePayment}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-white disabled:opacity-50"
          >
            {t("book.continue")}
          </button>
          <p className="mt-3 text-xs text-ink-3">{t("book.cancelNote")}</p>
        </aside>
      </div>
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
