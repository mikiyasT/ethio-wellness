"use client";

import { professionals, routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { useLocale } from "@/lib/locale";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function ClientPaymentPage() {
  const { t } = useLocale();
  const router = useRouter();
  const professional = professionals[0];

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(routes.clientBookingConfirmation);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">{t("pay.title")}</h1>
      <p className="mt-2 text-ink-2">
        {t("pay.line")} {professional.name}
      </p>
      <div className="mt-4">
        <Alert tone="info">{t("pay.demo")}</Alert>
      </div>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <TextField label={t("pay.card")} name="card" placeholder="4242 4242 4242 4242" />
        <div className="grid grid-cols-2 gap-3">
          <TextField label={t("pay.expiry")} name="expiry" placeholder="12/28" />
          <TextField label={t("pay.cvc")} name="cvc" placeholder="123" />
        </div>
        <TextField label={t("pay.name")} name="name" defaultValue="Miki Teshome" />
        <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-primary font-semibold text-white">
          Pay $40
        </button>
      </form>
    </div>
  );
}
