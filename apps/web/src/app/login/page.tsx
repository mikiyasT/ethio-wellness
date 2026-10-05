"use client";

import { routes } from "@ethio-wellness/shared";
import { BrandMark } from "@/components/brand-mark";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { db } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { DEMO_CLIENT, DEMO_PROVIDER, mockLoginByIdentifier } from "@/lib/mock-auth";
import { AUTO_APPROVE_PROFESSIONALS } from "@/lib/pro-approval";
import { useSession } from "@/lib/session";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

/** Keep booking deep-links; never send post-login traffic to Account. */
function postLoginDestination(role: "client" | "professional", next: string | null) {
  if (role === "professional") return routes.professionalHome;
  if (
    next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    next !== routes.account &&
    !next.startsWith(`${routes.account}/`) &&
    (next.startsWith("/client/") || next.startsWith("/professionals/"))
  ) {
    return next;
  }
  return routes.clientHome;
}

function LoginInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { setSessionFromUser, role, ready } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [errors, setErrors] = useState<{ email?: string; form?: string }>({});

  useEffect(() => {
    if (!ready || role === "guest") return;
    router.replace(role === "professional" ? routes.professionalHome : routes.clientHome);
  }, [ready, role, router]);

  async function completeLogin(rawId: string) {
    const dbUser = await mockLoginByIdentifier(rawId);
    await setSessionFromUser(dbUser);

    if (dbUser.role === "professional") {
      const pro = dbUser.professionalId
        ? await db.professionals.getById(dbUser.professionalId)
        : await db.professionals.getByUserId(dbUser.id);
      if (!AUTO_APPROVE_PROFESSIONALS && pro?.status === "pending") {
        router.push(routes.professionalPending);
        return;
      }
      router.push(routes.professionalHome);
      return;
    }

    router.push(postLoginDestination("client", search.get("next")));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const emailOrName = String(data.get("email") ?? identifier).trim();
    const nextErrors: typeof errors = {};
    if (!emailOrName) nextErrors.email = "Enter your username or email";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      // TODO: replace with real auth — no passwords stored
      await completeLogin(emailOrName);
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Could not sign in. Please try again.",
      });
    }
  }

  async function quickLogin(name: string) {
    setIdentifier(name);
    setErrors({});
    try {
      await completeLogin(name);
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Could not sign in. Please try again.",
      });
    }
  }

  const next = search.get("next");
  const registerHref = next ? `${routes.register}?next=${encodeURIComponent(next)}` : routes.register;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="mb-5 flex justify-center">
          <BrandMark size="lg" />
        </div>
        <h1 className="text-center text-3xl font-bold text-ink">{t("login.title")}</h1>
        <p className="mt-2 text-center text-ink-2">{t("login.sub")}</p>
        {errors.form ? (
          <div className="mt-4">
            <Alert tone="error">{errors.form}</Alert>
          </div>
        ) : null}

        <div className="mt-6 space-y-2 rounded-2xl border border-border bg-surface-warm p-4">
          <p className="text-sm font-medium text-ink">Demo accounts (no password)</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void quickLogin(DEMO_CLIENT.name)}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-ink hover:bg-primary-tint"
            >
              {DEMO_CLIENT.name}
            </button>
            <button
              type="button"
              onClick={() => void quickLogin(DEMO_PROVIDER.name)}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-ink hover:bg-primary-tint"
            >
              {DEMO_PROVIDER.name}
            </button>
          </div>
          <p className="text-xs text-ink-3">
            Or type <span className="font-medium">test client</span> /{" "}
            <span className="font-medium">test provider</span> below.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
          <TextField
            label="Username or email"
            name="email"
            type="text"
            autoComplete="username"
            placeholder="test client"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            error={errors.email}
          />
          <TextField
            label={`${t("login.password")} (optional for demo)`}
            name="password"
            type="password"
            placeholder="Leave blank for demo accounts"
          />
          <div className="text-right">
            <Link href={routes.forgotPassword} className="text-sm text-primary">
              {t("login.forgot")}
            </Link>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-on-primary hover:bg-primary-hover"
          >
            {t("login.submit")}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link href={registerHref} className="text-primary">
            {t("login.newHere")}
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-ink-3">🔒 {t("login.privacy")}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
