"use client";

import { categories, professionals, routes } from "@ethio-wellness/shared";
import { CategoryCard } from "@/components/domain/category-card";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function WelcomeHomePage() {
  const { t } = useLocale();
  const featured = professionals.slice(0, 3);
  const popular = categories.slice(0, 4);

  return (
    <div>
      <section className="bg-surface-warm">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">{t("home.kicker")}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.15] text-ink md:text-[44px]">
            {t("home.h1")}
          </h1>
          <p className="eth mt-3 text-lg text-ink-2">በቋንቋዎ የሚሰጥ የስነ-ልቦና ድጋፍ።</p>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-ink-2">{t("home.sub")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.professionals} size="lg">
              {t("home.ctaProfessionals")}
            </ButtonLink>
            <ButtonLink href={routes.services} variant="secondary" size="lg">
              {t("home.ctaServices")}
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-col gap-2 text-sm text-ink-2 md:flex-row md:gap-6">
            <li>✓ {t("home.trust1")}</li>
            <li>✓ {t("home.trust2")}</li>
            <li>✓ {t("home.trust3")}</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-[26px] font-bold text-ink md:text-[32px]">{t("home.howTitle")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [t("home.how1Title"), t("home.how1Body")],
            [t("home.how2Title"), t("home.how2Body")],
            [t("home.how3Title"), t("home.how3Body")],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-ink-2">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[26px] font-bold text-ink md:text-[32px]">{t("home.popular")}</h2>
          <ButtonLink href={routes.services} variant="text">
            {t("home.seeAll")}
          </ButtonLink>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              count={professionals.filter((item) => item.specialties.includes(category.id)).length}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[26px] font-bold text-ink md:text-[32px]">{t("home.featured")}</h2>
          <ButtonLink href={routes.professionals} variant="text">
            {t("home.browseAll")}
          </ButtonLink>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featured.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))}
        </div>
      </section>
    </div>
  );
}
