"use client";

import { routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { AuthRequestError, resetAccountPassword } from "@/lib/auth-api";
import { useLocale } from "@/lib/locale";
import { usePublicApi } from "@/lib/public-api";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") ?? "";
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    if (!usePublicApi()) {
      router.push(routes.login);
      return;
    }
    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }
    try {
      await resetAccountPassword(token, password);
      router.push(routes.login);
    } catch (err) {
      if (err instanceof AuthRequestError && err.code === "invalid_token") {
        setError("This reset link is invalid or has expired.");
        return;
      }
      setError("Could not reset the password. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <h1 className="text-3xl font-bold text-ink">{t("reset.title")}</h1>
        <p className="mt-2 text-ink-2">{t("reset.sub")}</p>
        {error ? <div className="mt-4"><Alert tone="error">{error}</Alert></div> : null}
        <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
          <TextField label={t("reset.password")} name="password" type="password" required />
          <TextField label={t("reset.confirm")} name="confirm" type="password" required />
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-primary font-semibold text-on-primary hover:bg-primary-hover">
            {t("reset.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
