"use client";

import { routes } from "@ethio-wellness/shared";
import { TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(routes.login);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <h1 className="text-3xl font-bold text-ink">{t("reset.title")}</h1>
        <p className="mt-2 text-ink-2">{t("reset.sub")}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
