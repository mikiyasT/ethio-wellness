"use client";

import { routes } from "@ethio-wellness/shared";
import { TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const nextErrors: typeof errors = {};
    if (!email) nextErrors.email = "Enter your email address";
    if (!password) nextErrors.password = "Enter your password";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      router.push(routes.clientHome);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
          EW
        </div>
        <h1 className="text-center text-3xl font-bold text-ink">{t("login.title")}</h1>
        <p className="mt-2 text-center text-ink-2">{t("login.sub")}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <TextField label={t("login.email")} name="email" type="email" placeholder="you@example.com" error={errors.email} />
          <TextField label={t("login.password")} name="password" type="password" error={errors.password} />
          <div className="text-right">
            <Link href={routes.forgotPassword} className="text-sm text-primary">
              {t("login.forgot")}
            </Link>
          </div>
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-primary font-semibold text-white hover:bg-primary-hover">
            {t("login.submit")}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-2">
          <Link href={routes.register} className="text-primary">
            {t("login.newHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}
