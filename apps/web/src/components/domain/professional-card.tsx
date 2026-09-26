"use client";

import { LANGUAGES, routes, type Professional } from "@ethio-wellness/shared";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { useLocale } from "@/lib/locale";

export function ProfessionalCard({ professional }: { professional: Professional }) {
  const { t } = useLocale();

  return (
    <article className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start gap-3">
        <Avatar initials={professional.initials} avatarClass={professional.avatarClass} />
        <div>
          <h3 className="text-lg font-semibold text-ink">{professional.name}</h3>
          <p className="text-sm text-ink-2">
            {professional.title} · {professional.city}
          </p>
          <p className="mt-1 text-sm text-gold">
            ★ {professional.rating} ({professional.reviewCount})
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
      <p className="mt-3 text-sm text-ink-2">
        {t("pros.next")}: {professional.nextSlotLabel}
      </p>
      <div className="mt-4">
        <ButtonLink href={routes.professionalDetail(professional.slug)} variant="secondary" block>
          {t("pros.viewProfile")}
        </ButtonLink>
      </div>
    </article>
  );
}
