"use client";

import { routes } from "@ethio-wellness/shared";
import { BrandMark } from "@/components/brand-mark";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { AuthRequestError, loginAccount } from "@/lib/auth-api";
import { useLocale } from "@/lib/locale";
import { isAwaitingApproval } from "@/lib/pro-approval";
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
  const { refresh, role, ready } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  useEffect(() => {
    if (!ready || role === "guest") return;
    router.replace(role === "professional" ? routes.professionalHome : routes.clientHome);
  }, [ready, role, router]);

  async function completeLogin(rawId: string, rawPassword: string) {
    const email = rawId.trim().toLowerCase();
    if (!email.includes("@")) throw new Error("Enter the email address for this account.");
    if (!rawPassword) throw new Error("Enter your password.");
    let user;
    try {
      const result = await loginAccount(email, rawPassword);
      user = result.user;
    } catch (error) {
      if (error instanceof AuthRequestError && error.code === "invalid_credentials") {
        throw new Error("That email and password do not match.");
      }
      throw error;
    }
    await refresh();
    if (user.role === "professional") {
      router.push(isAwaitingApproval(user.professionalStatus) ? routes.professionalPending : routes.professionalHome);
      return;
    }
    router.push(postLoginDestination("client", search.get("next")));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const emailOrName = String(data.get("email") ?? identifier).trim();
    const enteredPassword = String(data.get("password") ?? password);
    const nextErrors: typeof errors = {};
    if (!emailOrName) nextErrors.email = "Enter your email";
    if (!enteredPassword) nextErrors.password = "Enter your password";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await completeLogin(emailOrName, enteredPassword);
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

        <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
          <TextField
            label={t("login.email")}
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            error={errors.email}
          />
          <TextField
            label={t("login.password")}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          <div className="text-right">
            <Link href={routes.forgotPassword} className="text-sm text-teal-accent hover:underline">
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
          <Link href={registerHref} className="text-teal-accent hover:underline">
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
