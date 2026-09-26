"use client";

import { routes } from "@ethio-wellness/shared";
import { TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function RegisterPage() {
  const { t } = useLocale();
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(routes.roleSelection);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <h1 className="text-3xl font-bold text-ink">{t("register.title")}</h1>
        <p className="mt-2 text-ink-2">{t("register.sub")}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <TextField label={t("register.name")} name="name" required />
          <TextField label={t("login.email")} name="email" type="email" required />
          <TextField label={t("login.password")} name="password" type="password" required />
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-primary font-semibold text-white hover:bg-primary-hover">
            {t("register.submit")}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink-3">{t("register.terms")}</p>
        <p className="mt-4 text-sm">
          <Link href={routes.login} className="text-primary">
            {t("register.hasAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
