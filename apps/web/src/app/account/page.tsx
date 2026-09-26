"use client";

import { LANGUAGES, routes } from "@ethio-wellness/shared";
import { Chip } from "@/components/ui/chip";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { useState } from "react";

export default function AccountSettingsPage() {
  const { t } = useLocale();
  const [language, setLanguage] = useState("amharic");

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("account.title")}</h1>
      <div className="mt-6 space-y-6 rounded-2xl border border-border bg-surface p-6">
        <div>
          <p className="font-medium">{t("account.language")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGUAGES.map((item) => (
              <Chip key={item.id} selected={language === item.id} onClick={() => setLanguage(item.id)}>
                {item.nativeLabel}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="font-medium">{t("account.email")}</p>
          <p className="mt-1 text-ink-2">miki@example.com</p>
        </div>
        <Link href={routes.resetPassword} className="inline-flex min-h-11 items-center text-primary">
          {t("account.changePassword")}
        </Link>
        <Link href={routes.home} className="block text-error">
          {t("account.signOut")}
        </Link>
      </div>
    </div>
  );
}
