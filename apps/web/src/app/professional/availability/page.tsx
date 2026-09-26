"use client";

import { availabilitySlots } from "@ethio-wellness/shared";
import { SlotChip } from "@/components/domain/slot-chip";
import { Alert } from "@/components/ui/alert";
import { useLocale } from "@/lib/locale";
import { useState } from "react";

export default function ProfessionalAvailabilityPage() {
  const { t } = useLocale();
  const [slots, setSlots] = useState(availabilitySlots.filter((slot) => slot.professionalId === "pro-hana-tesfaye"));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("proAvail.title")}</h1>
      <p className="mt-2 text-ink-2">{t("proAvail.sub")}</p>
      <div className="mt-4 flex gap-4 text-sm">
        <span>{t("proAvail.available")}</span>
        <span className="text-ink-3">{t("proAvail.booked")}</span>
      </div>
      <div className="mt-6 space-y-4">
        {["Today", "Tomorrow", "Fri"].map((day) => (
          <div key={day}>
            <p className="mb-2 font-medium">{day}</p>
            <div className="flex flex-wrap gap-2">
              {slots
                .filter((slot) => slot.dayLabel === day)
                .map((slot) => (
                  <SlotChip
                    key={slot.id}
                    label={slot.timeLabel}
                    status={slot.status}
                    onClick={() =>
                      setSlots((current) =>
                        current.map((item) =>
                          item.id === slot.id && item.status !== "booked"
                            ? { ...item, status: item.status === "open" ? "booked" : "open" }
                            : item,
                        ),
                      )
                    }
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Alert tone="warning">{t("proAvail.note")}</Alert>
      </div>
    </div>
  );
}
