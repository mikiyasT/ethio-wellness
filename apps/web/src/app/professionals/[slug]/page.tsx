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
import { Button, ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { bookPath } from "@/lib/booking";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function ProfessionalDetailPage() {
  const { t } = useLocale();
  const router = useRouter();
  const { role } = useSession();
  const params = useParams<{ slug: string }>();
  const professional = professionalBySlug(params.slug);
  const [gateOpen, setGateOpen] = useState(false);
  const slots = useMemo(
    () => availabilitySlots.filter((slot) => slot.professionalId === professional?.id),
    [professional?.id],
  );
  const firstOpen = slots.find((slot) => slot.status === "open")?.id ?? "";
  const [selected, setSelected] = useState(firstOpen);

  if (!professional) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title={t("notFound.title")} body={t("notFound.body")} actionHref={routes.professionals} actionLabel={t("notFound.cta")} />
      </div>
    );
  }

  const grouped = slots.reduce<Record<string, typeof slots>>((acc, slot) => {
    acc[slot.dayLabel] ??= [];
    acc[slot.dayLabel].push(slot);
    return acc;
  }, {});
  const selectedSlot = slots.find((slot) => slot.id === selected);
  const nextHref = selectedSlot ? bookPath(professional.slug, selectedSlot.id) : routes.clientBook;

  function onBook() {
    if (!selectedSlot) return;
    if (role === "client") {
      router.push(nextHref);
      return;
    }
    setGateOpen(true);
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
          <Button disabled={!selectedSlot} onClick={onBook} block>
            {t("detail.book")}
            {selectedSlot ? ` · ${selectedSlot.timeLabel}` : ""}
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
              <dd>{t("detail.fee")}</dd>
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
      {gateOpen ? <AuthGate next={nextHref} onClose={() => setGateOpen(false)} /> : null}
    </div>
  );
}
