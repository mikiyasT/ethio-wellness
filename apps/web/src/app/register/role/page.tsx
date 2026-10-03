"use client";

import { routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { db } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { defaultProfessionalStatus } from "@/lib/pro-approval";
import { useSession } from "@/lib/session";
import { Stethoscope, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function RoleSelectionInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { setSessionFromUser } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const next = search.get("next");
  const name = search.get("name") ?? "";
  const email = search.get("email") ?? "";

  async function chooseClient() {
    if (!email.trim()) {
      setError("Missing email from registration. Please go back and create your account again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let user = await db.users.findByEmail(email);
      if (!user) {
        user = await db.users.create({
          name: name.trim() || email.split("@")[0] || "Client",
          email,
          role: "client",
        });
      } else if (user.role !== "client") {
        await db.users.update(user.id, { role: "client", name: name.trim() || user.name });
        user = (await db.users.getById(user.id)) ?? user;
      }
      await setSessionFromUser(user);
      if (
        next &&
        next.startsWith("/") &&
        !next.startsWith("//") &&
        next !== routes.account &&
        !next.startsWith(`${routes.account}/`) &&
        (next.startsWith("/client/") || next.startsWith("/professionals/"))
      ) {
        router.push(next);
        return;
      }
      router.push(routes.clientOnboarding);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not create your account. Please try again.");
    }
  }

  async function chooseProfessional() {
    if (!email.trim()) {
      setError("Missing email from registration. Please go back and create your account again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const displayName = name.trim() || email.split("@")[0] || "Professional";
      let user = await db.users.findByEmail(email);
      if (!user) {
        user = await db.users.create({
          name: displayName,
          email,
          role: "professional",
        });
      }

      let pro = await db.professionals.getByUserId(user.id);
      if (!pro) {
        pro = await db.professionals.create({
          userId: user.id,
          name: displayName,
          title: "",
          city: "",
          status: defaultProfessionalStatus(),
          languages: [],
          specialties: [],
        });
      } else {
        await db.users.update(user.id, {
          role: "professional",
          name: displayName,
          professionalId: pro.id,
        });
      }

      const refreshed = await db.users.getById(user.id);
      await setSessionFromUser(refreshed ?? user);
      router.push(routes.professionalOnboarding);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not create your professional account. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">{t("role.title")}</h1>
      {!email ? (
        <div className="mt-4">
          <Alert tone="error">
            Registration details were missing.{" "}
            <a href={routes.register} className="underline">
              Create your account again
            </a>
            .
          </Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          disabled={busy || !email}
          onClick={() => void chooseClient()}
          className="rounded-2xl border border-border bg-surface p-6 text-left hover:border-primary disabled:opacity-60"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-tint text-primary">
            <Users />
          </div>
          <h2 className="mt-4 text-xl font-semibold">{t("role.clientTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("role.clientBody")}</p>
        </button>
        <button
          type="button"
          disabled={busy || !email}
          onClick={() => void chooseProfessional()}
          className="rounded-2xl border border-border bg-surface p-6 text-left hover:border-primary disabled:opacity-60"
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
