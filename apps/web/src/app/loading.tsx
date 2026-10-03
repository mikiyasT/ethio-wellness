"use client";

import { useLocale } from "@/lib/locale";

export default function LoadingPage() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="keep-round flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
        AZ
      </div>
      <p className="mt-4 text-xl font-semibold text-ink">{t("brand")}</p>
      <p className="mt-2 max-w-md text-ink-2">{t("splash.tagline")}</p>
    </div>
  );
}
