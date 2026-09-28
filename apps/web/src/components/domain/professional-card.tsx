"use client";

import { LANGUAGES, categoryById, routes, type Professional } from "@ethio-wellness/shared";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { useLocale } from "@/lib/locale";
import { Star } from "lucide-react";

export function ProfessionalCard({ professional }: { professional: Professional }) {
  const { t } = useLocale();

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_0_rgba(34,26,17,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar initials={professional.initials} avatarClass={professional.avatarClass} />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-ink">{professional.name}</h3>
          <p className="text-sm text-ink-2">
            {professional.title} · {professional.city}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-gold">
            <Star size={14} fill="currentColor" />
            {professional.rating} ({professional.reviewCount})
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {professional.languages.map((language) => {
          const item = LANGUAGES.find((entry) => entry.id === language);
          return (
            <Tag key={language} eth={language === "amharic" || language === "tigrinya"}>
              {item?.nativeLabel ?? language}
            </Tag>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {professional.specialties.map((id) => (
          <Tag key={id}>{categoryById(id)?.name}</Tag>
        ))}
      </div>
      <p className="mt-4 rounded-full bg-primary-tint px-3 py-2 text-sm text-primary">
        {t("pros.nextOpen")}: {professional.nextSlotLabel}
      </p>
      <div className="mt-auto pt-4">
        <ButtonLink href={routes.professionalDetail(professional.slug)} variant="outline" block>
          {t("pros.viewProfile")}
        </ButtonLink>
      </div>
    </article>
  );
}
