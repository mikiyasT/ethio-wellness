"use client";

import { routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { resolveBookingContext } from "@/lib/booking";
import { useLocale } from "@/lib/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

function ClientPaymentInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { professional, slot, dateLabel, fee } = useMemo(
    () => resolveBookingContext(search.get("pro"), search.get("slot")),
    [search],
  );
  const [state, setState] = useState<"idle" | "processing" | "failed">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState("processing");
    window.setTimeout(() => {
      if (String(data.get("card")).includes("0000")) {
        setState("failed");
        return;
      }
      const params = new URLSearchParams({
        pro: professional.slug,
        slot: slot?.id ?? "",
      });
      router.push(`${routes.clientBookingConfirmation}?${params.toString()}`);
    }, 800);
  }

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-bold text-ink">{t("pay.title")}</h1>
      <p className="mt-2 text-ink-2">
        {t("pay.line")} {professional.name} · {dateLabel} · {fee}
      </p>
      <div className="mt-4">
        <Alert tone={state === "failed" ? "error" : "info"}>
          {state === "failed" ? "Payment failed. Please check your card and try again." : t("pay.demo")}
        </Alert>
      </div>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <TextField label={t("pay.card")} name="card" placeholder="4242 4242 4242 4242" />
        <div className="grid grid-cols-2 gap-3">
          <TextField label={t("pay.expiry")} name="expiry" placeholder="12/28" />
          <TextField label={t("pay.cvc")} name="cvc" placeholder="123" />
        </div>
        <TextField label={t("pay.name")} name="name" defaultValue="Abel Desta" />
        <button
          type="submit"
          disabled={state === "processing"}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-white disabled:opacity-60"
        >
          {state === "processing" ? "Processing…" : `Pay ${fee}`}
        </button>
      </form>
    </div>
  );
}

export default function ClientPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-2">Loading…</div>}>
      <ClientPaymentInner />
    </Suspense>
  );
}
