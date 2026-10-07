"use client";

import { LANGUAGES, routes, type Professional } from "@ethio-wellness/shared";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { useLocale } from "@/lib/locale";
import { Star } from "lucide-react";

export function ProfessionalCard({ professional }: { professional: Professional }) {
  const { t } = useLocale();

  return (
    <article className="flex h-full w-full min-w-0 flex-col rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_0_rgba(34,26,17,0.04)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar
          initials={professional.initials}
          avatarClass={professional.avatarClass}
          photoUrl={professional.photoUrl}
          name={professional.name}
          size="lg"
          shape="rounded"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-ink">{professional.name}</h3>
          <p className="truncate text-sm text-ink-2">
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

      <div className="mt-auto pt-4">
        <ButtonLink href={routes.professionalDetail(professional.slug)} variant="outline" block>
          {t("pros.viewProfile")}
        </ButtonLink>
      </div>
    </article>
  );
}
