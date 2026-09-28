"use client";

import { routes } from "@ethio-wellness/shared";
import { BrandMark } from "@/components/brand-mark";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import { mockSessionForEmail } from "@/lib/mock-auth";
import { useSession } from "@/lib/session";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { setSession } = useSession();
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const nextErrors: typeof errors = {};
    if (!email) nextErrors.email = "Enter your email address";
    if (!password) nextErrors.password = "Enter your password";
    if (email && password && email === "wrong@example.com") {
      nextErrors.form = t("login.invalid");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // TODO: replace with real auth
    const session = mockSessionForEmail(email);
    setSession(session);

    const next = search.get("next");
    if (next && next.startsWith("/") && session.role === "client") {
      router.push(next);
      return;
    }
    router.push(session.role === "professional" ? routes.professionalHome : routes.clientHome);
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
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <TextField label={t("login.email")} name="email" type="email" placeholder="you@example.com" error={errors.email} />
          <TextField label={t("login.password")} name="password" type="password" placeholder="Your password" error={errors.password} />
          <div className="text-right">
            <Link href={routes.forgotPassword} className="text-sm text-primary">
              {t("login.forgot")}
            </Link>
          </div>
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-white hover:bg-primary-hover">
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
