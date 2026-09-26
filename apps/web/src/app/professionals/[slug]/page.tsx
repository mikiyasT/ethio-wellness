"use client";

import {
  LANGUAGES,
  availabilitySlots,
  categoryById,
  professionalBySlug,
  routes,
} from "@ethio-wellness/shared";
import { AuthGate } from "@/components/domain/auth-gate";
import { SlotChip } from "@/components/domain/slot-chip";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/lib/locale";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProfessionalDetailPage() {
  const { t } = useLocale();
  const params = useParams<{ slug: string }>();
  const professional = professionalBySlug(params.slug);
  const [gateOpen, setGateOpen] = useState(false);

  if (!professional) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title={t("notFound.title")} body={t("notFound.body")} actionHref={routes.professionals} actionLabel={t("notFound.cta")} />
      </div>
    );
  }

  const slots = availabilitySlots.filter((slot) => slot.professionalId === professional.id);
  const grouped = slots.reduce<Record<string, typeof slots>>((acc, slot) => {
    acc[slot.dayLabel] ??= [];
    acc[slot.dayLabel].push(slot);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-start gap-4">
        <Avatar initials={professional.initials} avatarClass={professional.avatarClass} size="lg" />
        <div>
          <h1 className="text-3xl font-bold text-ink">{professional.name}</h1>
          <p className="text-ink-2">
            {professional.title} · {professional.city}
          </p>
          <p className="mt-1 text-gold">
            ★ {professional.rating} ({professional.reviewCount})
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

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">{t("detail.availability")}</h2>
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
                      onClick={() => slot.status === "open" && setGateOpen(true)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <ButtonLink href={routes.professionals} variant="secondary">
          {t("detail.browseSimilar")}
        </ButtonLink>
      </div>

      {gateOpen ? <AuthGate onClose={() => setGateOpen(false)} /> : null}
    </div>
  );
}
