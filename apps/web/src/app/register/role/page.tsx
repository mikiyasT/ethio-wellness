"use client";

import { routes } from "@ethio-wellness/shared";
import { useLocale } from "@/lib/locale";
import Link from "next/link";

export default function RoleSelectionPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">{t("role.title")}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href={routes.clientOnboarding} className="rounded-2xl border border-border bg-surface p-6 hover:border-primary">
          <h2 className="text-xl font-semibold">{t("role.clientTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("role.clientBody")}</p>
        </Link>
        <Link href={routes.professionalOnboarding} className="rounded-2xl border border-border bg-surface p-6 hover:border-primary">
          <h2 className="text-xl font-semibold">{t("role.proTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("role.proBody")}</p>
        </Link>
      </div>
    </div>
  );
}
