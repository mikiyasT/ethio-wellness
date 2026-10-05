"use client";

import { routes } from "@ethio-wellness/shared";
import { ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";
import Image from "next/image";

const LANGUAGES_ROWS = [
  { primary: "አማርኛ", secondary: "Amharic", eth: true, lang: "am" },
  { primary: "Afaan Oromoo", secondary: "Oromoo", eth: false },
  { primary: "ትግርኛ", secondary: "Tigrinya", eth: true, lang: "ti" },
  { primary: "English", secondary: "English", eth: false },
] as const;

export default function WelcomeHomePage() {
  const { t } = useLocale();

  return (
    <div className="marketing overflow-hidden">
      {/* HERO */}
      <section
        aria-labelledby="main-title"
        className="mx-auto grid max-w-[1260px] items-center gap-[clamp(38px,7vw,110px)] px-[clamp(24px,5vw,72px)] pb-[76px] pt-[clamp(52px,8vw,110px)] md:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.98fr)]"
      >
        <div className="max-w-[690px]">
          <p className="mb-6 inline-flex items-center gap-2.5 text-[0.86rem] font-extrabold uppercase tracking-[0.08em] text-teal-accent">
            <span
              className="ayzon-pulse-dot inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            {t("home.kicker")}
          </p>
          <h1
            id="main-title"
            className="max-w-[760px] text-[clamp(3.2rem,7.2vw,4.75rem)] font-extrabold leading-[0.94] tracking-[-0.065em] text-ink"
          >
            {t("home.h1")}
          </h1>
          <span className="eth mt-5 block text-[clamp(1.25rem,2vw,1.8rem)] font-bold text-teal-accent" lang="am">
            {t("home.amharicSub")}
          </span>
          <p className="mt-7 max-w-[610px] text-[clamp(1.05rem,1.6vw,1.26rem)] leading-relaxed text-ink-2">
            {t("home.sub")}
          </p>
          <p className="mt-4 text-sm font-semibold text-ink-2">{t("home.guestPromise")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            <ButtonLink
              href={routes.professionals}
              variant="primary"
              size="lg"
              className="rounded-[8px] font-extrabold shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
            >
              {t("home.ctaBrowse")}
            </ButtonLink>
            <ButtonLink href={routes.login} variant="text" size="lg" className="font-extrabold">
              {t("home.ctaSignIn")}
            </ButtonLink>
          </div>
        </div>

        <div
          className="relative mx-auto h-[clamp(520px,67vw,720px)] min-h-[500px] w-full max-w-[560px] max-h-[720px] justify-self-center md:mx-0 md:max-w-none"
          aria-label="Ayzon campaign portraits"
        >
          <div
            className="absolute left-[39%] top-[46%] z-0 h-[110px] w-[110px] rounded-full bg-primary opacity-[0.84] max-[520px]:h-[76px] max-[520px]:w-[76px]"
            aria-hidden
          >
            <span className="absolute -left-[55px] top-[62px] h-[90px] w-[220px] rounded-t-full bg-teal-accent opacity-20" />
          </div>
          <div className="absolute left-[4%] top-0 z-[1] w-[min(62%,330px)] -rotate-3 overflow-hidden rounded-[18px] shadow-[0_24px_65px_rgba(0,0,0,0.34)] max-[520px]:left-[1%] max-[520px]:w-[61%] max-[520px]:rounded-[13px]">
            <Image
              src="/home/poster-female-v4.jpg"
              alt="Ayzon campaign poster featuring a young Ethiopian woman"
              width={660}
              height={1174}
              className="aspect-[9/16] h-auto w-full object-cover"
              priority
              sizes="(max-width: 820px) 61vw, 330px"
            />
          </div>
          <div className="absolute bottom-0 right-[-3%] z-[2] w-[min(62%,330px)] origin-[50%_82%] rotate-[9deg] overflow-hidden rounded-[18px] shadow-[0_24px_65px_rgba(0,0,0,0.34)] max-[520px]:right-0 max-[520px]:w-[61%] max-[520px]:rounded-[13px]">
            <Image
              src="/home/poster-male-v4.jpg"
              alt="Ayzon campaign poster featuring a young Ethiopian man"
              width={660}
              height={1174}
              className="aspect-[9/16] h-auto w-full object-cover"
              priority
              sizes="(max-width: 820px) 61vw, 330px"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-primary-dark text-ink" aria-labelledby="how-title">
        <div className="mx-auto max-w-[1160px] px-[clamp(24px,5vw,64px)] py-[clamp(68px,9vw,110px)]">
          <h2
            id="how-title"
            className="text-[clamp(2.4rem,5vw,3.75rem)] font-extrabold leading-none tracking-[-0.045em] text-ink"
          >
            {t("home.howTitle")}
          </h2>
          <div className="mt-10 grid gap-0 border-t border-white/20 pt-2 md:grid-cols-3">
            {[
              { num: "01", title: t("home.how1Title"), body: t("home.how1Body") },
              { num: "02", title: t("home.how2Title"), body: t("home.how2Body") },
              { num: "03", title: t("home.how3Title"), body: t("home.how3Body") },
            ].map((step, index) => (
              <article
                key={step.num}
                className={`py-8 md:py-10 md:pr-8 ${
                  index > 0 ? "border-t border-white/20 md:border-l md:border-t-0 md:pl-8" : ""
                }`}
              >
                <span className="text-[0.8rem] font-extrabold tracking-[0.12em] text-primary">{step.num}</span>
                <h3 className="mt-3.5 text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-[0.95rem] text-white/70">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section
        aria-labelledby="language-title"
        className="mx-auto grid max-w-[1160px] items-center gap-[clamp(50px,8vw,110px)] px-[clamp(24px,5vw,64px)] py-[clamp(75px,10vw,130px)] md:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]"
      >
        <h2
          id="language-title"
          className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[1.03] tracking-[-0.05em] text-ink"
        >
          {t("home.langTitle")}
        </h2>
        <div className="grid gap-3" aria-label="Language options">
          {LANGUAGES_ROWS.map((row) => (
            <div
              key={row.primary}
              className="flex min-h-[74px] items-center justify-between border-b-2 border-border bg-surface px-[22px]"
            >
              <strong className={`text-[1.05rem] text-ink ${row.eth ? "eth" : ""}`} {...(row.eth && row.lang ? { lang: row.lang } : {})}>
                {row.primary}
              </strong>
              <span className="text-[0.84rem] font-extrabold text-teal-accent">{row.secondary}</span>
            </div>
          ))}
          <div className="flex min-h-[66px] items-center justify-between border border-dashed border-border-strong px-[22px] text-ink-3">
            <span className="font-semibold">{t("home.langMore")}</span>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section
        aria-labelledby="closing-title"
        className="mx-auto max-w-[1160px] px-[clamp(24px,5vw,64px)] pb-[100px]"
      >
        <div className="relative grid items-center gap-8 overflow-hidden rounded-[14px] border border-border bg-surface p-[clamp(40px,6vw,70px)] md:grid-cols-[1fr_auto]">
          <div
            className="pointer-events-none absolute -bottom-[105px] -right-[75px] h-[190px] w-[190px] rounded-full bg-primary opacity-90"
            aria-hidden
          />
          <div className="relative z-[1]">
            <h2
              id="closing-title"
              className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink"
            >
              {t("home.closeTitle")}
            </h2>
            <p className="mt-3.5 max-w-[610px] text-ink-2">{t("home.closeBody")}</p>
          </div>
          <ButtonLink
            href={routes.professionals}
            variant="primary"
            size="lg"
            className="relative z-[1] justify-self-start rounded-[8px] font-extrabold whitespace-nowrap"
          >
            {t("home.ctaBrowse")}
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
