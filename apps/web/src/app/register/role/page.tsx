"use client";

import { routes } from "@ethio-wellness/shared";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { Stethoscope, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RoleSelectionInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { setSession } = useSession();
  const next = search.get("next");
  const name = search.get("name") ?? "Abel Desta";
  const email = search.get("email") ?? "abel@example.com";

  function chooseClient() {
    setSession({ role: "client", name, email });
    if (next && next.startsWith("/")) {
      router.push(next);
      return;
    }
    router.push(routes.clientOnboarding);
  }

  function chooseProfessional() {
    setSession({
      role: "professional",
      name,
      email,
      professionalStatus: "pending",
    });
    router.push(routes.professionalOnboarding);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">{t("role.title")}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={chooseClient}
          className="rounded-2xl border border-border bg-surface p-6 text-left hover:border-primary"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-tint text-primary">
            <Users />
          </div>
          <h2 className="mt-4 text-xl font-semibold">{t("role.clientTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("role.clientBody")}</p>
        </button>
        <button
          type="button"
          onClick={chooseProfessional}
          className="rounded-2xl border border-border bg-surface p-6 text-left hover:border-primary"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-tint text-gold">
            <Stethoscope />
          </div>
          <h2 className="mt-4 text-xl font-semibold">{t("role.proTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("role.proBody")}</p>
        </button>
      </div>
    </div>
  );
}

export default function RoleSelectionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <RoleSelectionInner />
    </Suspense>
  );
}
