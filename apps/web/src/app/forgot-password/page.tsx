"use client";

import { routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <h1 className="text-3xl font-bold text-ink">{t("forgot.title")}</h1>
        <p className="mt-2 text-ink-2">{t("forgot.sub")}</p>
        {sent ? <div className="mt-4"><Alert tone="success">Check your email for a reset link.</Alert></div> : null}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <TextField label={t("login.email")} name="email" type="email" required />
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-primary font-semibold text-on-primary hover:bg-primary-hover">
            {t("forgot.submit")}
          </button>
        </form>
        <p className="mt-4 text-sm">
          <Link href={routes.login} className="text-teal-accent hover:underline">
            {t("forgot.back")}
          </Link>
        </p>
      </div>
    </div>
  );
}
