"use client";

import { LANGUAGES, routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountSettingsPage() {
  const { t, setLocale, locale } = useLocale();
  const { signOut, user } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState(
    locale === "am" ? "amharic" : locale === "ti" ? "tigrinya" : locale === "om" ? "afaan-oromoo" : "english",
  );

  return (
    <div className="max-w-[560px]">
      <h1 className="text-3xl font-bold text-ink">{t("account.title")}</h1>
      <p className="mt-2 text-ink-2">{t("account.sub")}</p>
      {saved ? (
        <div className="mt-4">
          <Alert tone="success">{t("prefs.saved")}</Alert>
        </div>
      ) : null}
      <div className="mt-6 space-y-6 rounded-2xl border border-border bg-surface p-6">
        <label className="block">
          <span className="font-medium">{t("account.language")}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-[10px] border border-border bg-surface px-3"
          >
            {LANGUAGES.filter((item) => item.id === "english" || item.id === "amharic").map((item) => (
              <option key={item.id} value={item.id}>
                {item.nativeLabel}
              </option>
            ))}
            {LANGUAGES.filter((item) => item.id === "tigrinya" || item.id === "afaan-oromoo").map((item) => (
              <option key={item.id} value={item.id} disabled>
                {item.nativeLabel} ({t("chrome.comingSoon")})
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-ink-3">{t("account.languageHint")}</p>
        </label>
        <div>
          <p className="font-medium">{t("account.email")}</p>
          <input
            readOnly
            value={user.email ?? "abel@example.com"}
            className="mt-2 min-h-12 w-full rounded-[10px] border border-border bg-surface-warm px-3 text-ink-2"
          />
          <p className="mt-2 text-sm text-ink-3">{t("account.emailNote")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => {
              const map = { amharic: "am", english: "en" } as const;
              if (language === "amharic" || language === "english") {
                setLocale(map[language]);
                setSaved(true);
              }
            }}
          >
            {t("account.save")}
          </Button>
          <ButtonLink href={routes.resetPassword} variant="secondary">
            {t("account.changePassword")}
          </ButtonLink>
          <Button
            variant="danger"
            onClick={() => {
              signOut();
              router.push(routes.home);
            }}
          >
            {t("account.signOut")}
          </Button>
        </div>
      </div>
    </div>
  );
}
