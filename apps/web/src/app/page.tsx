"use client";

import { LANGUAGES, categories, professionals, routes } from "@ethio-wellness/shared";
import { CategoryCard } from "@/components/domain/category-card";
import { ProfessionalCard } from "@/components/domain/professional-card";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";
import { CalendarDays, Laptop, Search } from "lucide-react";

export default function WelcomeHomePage() {
  const { t } = useLocale();
  const featured = professionals.slice(0, 3);
  const popular = categories.slice(0, 4);

  return (
    <div>
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:py-24">
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
            {t("home.kicker")}
          </p>
          <h1 className="mt-5 max-w-3xl text-[32px] font-bold leading-[1.15] md:text-[44px]">
            {t("home.h1")}
          </h1>
          <p className="eth mt-4 text-lg text-white/85">{t("home.amharicSub")}</p>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-white/80">{t("home.sub")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.professionals} variant="gold" size="lg">
              {t("home.ctaProfessionals")}
            </ButtonLink>
            <ButtonLink href={routes.services} variant="ghost" size="lg">
              {t("home.ctaServices")}
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-3">
            {[t("home.trust1"), t("home.trust2"), t("home.trust3")].map((item) => (
              <li key={item} className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1.5">
                ✓ {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">{t("home.howTitle")}</p>
        <h2 className="mt-2 text-[26px] font-bold text-ink md:text-[32px]">{t("home.howHeading")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { Icon: Search, title: t("home.how1Title"), body: t("home.how1Body") },
            { Icon: CalendarDays, title: t("home.how2Title"), body: t("home.how2Body") },
            { Icon: Laptop, title: t("home.how3Title"), body: t("home.how3Body") },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-tint text-primary">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-ink-2">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pb-16">
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

      <section className="bg-surface-warm">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <div className="flex flex-wrap items-center gap-2">
            {LANGUAGES.map((language) => (
              <span
                key={language.id}
                className="rounded-full bg-surface px-3 py-2 text-sm text-ink"
              >
                {language.nativeLabel}
              </span>
            ))}
            <span className="rounded-full border border-dashed border-border-strong px-3 py-2 text-sm text-ink-2">
              {t("home.moreComing")}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16">
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

      <section className="mx-auto max-w-[1200px] px-4 pb-16">
        <div className="rounded-3xl bg-primary px-6 py-10 text-white md:px-10">
          <h2 className="text-[26px] font-bold md:text-[32px]">{t("home.ctaBand")}</h2>
          <p className="mt-2 max-w-xl text-white/80">{t("home.ctaBandBody")}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.register} variant="gold" size="lg">
              {t("home.createFree")}
            </ButtonLink>
            <ButtonLink href={routes.professionals} variant="ghost" size="lg">
              {t("home.keepBrowsing")}
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
