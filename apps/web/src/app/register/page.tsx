"use client";

import { routes } from "@ethio-wellness/shared";
import { BrandMark } from "@/components/brand-mark";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function RegisterInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const next: Record<string, string> = {};
    if (!name) next.name = "Enter your full name";
    if (!email) next.email = "Enter your email address";
    if (password.length < 8) next.password = "Use at least 8 characters";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const held = search.get("next");
    const params = new URLSearchParams();
    if (held) params.set("next", held);
    if (name) params.set("name", name);
    if (email) params.set("email", email);
    const qs = params.toString();
    router.push(qs ? `${routes.roleSelection}?${qs}` : routes.roleSelection);
  }

  const next = search.get("next");
  const loginHref = next ? `${routes.login}?next=${encodeURIComponent(next)}` : routes.login;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="mb-5 flex justify-center">
          <BrandMark size="lg" />
        </div>
        <h1 className="text-3xl font-bold text-ink">{t("register.title")}</h1>
        <p className="mt-2 text-ink-2">{t("register.sub")}</p>
        {Object.keys(errors).length > 0 ? (
          <div className="mt-4">
            <Alert tone="error">Please fix the highlighted fields.</Alert>
          </div>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <TextField label={t("register.name")} name="name" error={errors.name} />
          <TextField label={t("login.email")} name="email" type="email" error={errors.email} />
          <TextField label={t("login.password")} name="password" type="password" error={errors.password} />
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-white">
            {t("register.submit")}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink-3">{t("register.terms")}</p>
        <p className="mt-4 text-sm">
          <Link href={loginHref} className="text-primary">
            {t("register.hasAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <RegisterInner />
    </Suspense>
  );
}
