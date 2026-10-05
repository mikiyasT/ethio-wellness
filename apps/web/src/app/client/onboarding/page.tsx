"use client";

import { LANGUAGES, categories, routes } from "@ethio-wellness/shared";
import { Chip } from "@/components/ui/chip";
import { TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ClientOnboardingPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [language, setLanguage] = useState("english");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(routes.clientOnboardingPreferences);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("onboard.title")}</h1>
      <p className="mt-2 text-ink-2">{t("onboard.sub")}</p>
      <form className="mt-6 space-y-6" onSubmit={onSubmit}>
        <TextField label="Display name" name="name" defaultValue="Abel Desta" />
        <div>
          <p className="mb-2 text-sm font-medium">{t("account.language")}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((item) => (
              <Chip key={item.id} selected={language === item.id} onClick={() => setLanguage(item.id)} eth={item.id !== "english" && item.id !== "afaan-oromoo"}>
                {item.nativeLabel}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">{t("onboard.looking")}</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip key={category.id}>{category.name}</Chip>
            ))}
          </div>
        </div>
        <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-primary font-semibold text-on-primary">
          {t("onboard.continue")}
        </button>
        <Link href={routes.clientHome} className="block text-center text-primary">
          {t("onboard.skip")}
        </Link>
      </form>
    </div>
  );
}
