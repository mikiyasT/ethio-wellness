"use client";

import { availabilitySlots, professionals, routes } from "@ethio-wellness/shared";
import { SlotChip } from "@/components/domain/slot-chip";
import { Avatar } from "@/components/ui/avatar";
import { useLocale } from "@/lib/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientBookPage() {
  const { t } = useLocale();
  const router = useRouter();
  const professional = professionals[0];
  const [selected, setSelected] = useState("slot-2");
  const slots = availabilitySlots.filter((slot) => slot.professionalId === professional.id);

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">{t("book.title")}</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6 rounded-2xl border border-border bg-surface p-6">
          <section>
            <h2 className="font-semibold">{t("book.step1")}</h2>
            <p className="mt-2 rounded-full border border-border bg-primary-tint px-4 py-3 text-primary">Sat Oct 3</p>
          </section>
          <section>
            <h2 className="font-semibold">{t("book.step2")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <SlotChip
                  key={slot.id}
                  label={`${slot.dayLabel} ${slot.timeLabel}`}
                  status={slot.status}
                  selected={selected === slot.id}
                  onClick={() => slot.status === "open" && setSelected(slot.id)}
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
              <p className="text-sm text-ink-2">Individual Mental Health</p>
            </div>
          </div>
          <p className="mt-4 text-sm">Sat Oct 3, 4:00 PM</p>
          <p className="text-sm">{t("book.duration")}</p>
          <p className="mt-2 text-xl font-semibold">$25</p>
          <button
            type="button"
            onClick={() => router.push(routes.clientPayment)}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-white"
          >
            {t("book.continue")}
          </button>
          <p className="mt-3 text-xs text-ink-3">{t("book.cancelNote")}</p>
        </aside>
      </div>
    </div>
  );
}
