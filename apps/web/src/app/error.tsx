"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-ink">{t("error.title")}</h1>
      <p className="mt-3 text-ink-2">{t("error.body")}</p>
      <div className="mt-6">
        <Button onClick={reset}>{t("error.cta")}</Button>
      </div>
    </div>
  );
}
