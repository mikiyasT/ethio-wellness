"use client";

import { routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/field";
import { createBookingFromPayment, resolveBookingContext } from "@/lib/booking";
import type { DbProfessional, DbSlot } from "@/lib/db";
import { formatFee } from "@/lib/db";
import { useLocale } from "@/lib/locale";
import { useSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

function ClientPaymentInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { user } = useSession();
  const [professional, setProfessional] = useState<DbProfessional | null>(null);
  const [slot, setSlot] = useState<DbSlot | undefined>();
  const [dateLabel, setDateLabel] = useState("");
  const [fee, setFee] = useState("");
  const [state, setState] = useState<"idle" | "processing" | "failed" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const ctx = await resolveBookingContext(search.get("pro"), search.get("slot"));
      setProfessional(ctx.professional);
      setSlot(ctx.slot);
      setDateLabel(ctx.dateLabel);
      setFee(ctx.fee);
    })();
  }, [search]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user.userId || !professional || !slot) {
      setError("Sign in and pick a valid slot to continue.");
      setState("error");
      return;
    }
    const data = new FormData(event.currentTarget);
    setState("processing");
    setError("");
    window.setTimeout(() => {
      void (async () => {
        if (String(data.get("card")).includes("0000")) {
          setState("failed");
          return;
        }
        try {
          const { bookingId } = await createBookingFromPayment({
            clientId: user.userId!,
            professionalId: professional.id,
            slotId: slot.id,
          });
          router.push(`${routes.clientBookingConfirmation}?booking=${bookingId}`);
        } catch (err) {
          setState("error");
          setError(err instanceof Error ? err.message : "Could not create booking.");
        }
      })();
    }, 800);
  }

  if (!professional) {
    return <div className="p-8 text-ink-2">Loading…</div>;
  }

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-bold text-ink">{t("pay.title")}</h1>
      <p className="mt-2 text-ink-2">
        {t("pay.line")} {professional.name} · {dateLabel} · {fee || formatFee(professional.fee)}
      </p>
      <div className="mt-4">
        <Alert tone={state === "failed" || state === "error" ? "error" : "info"}>
          {state === "failed"
            ? "Payment failed. Please check your card and try again."
            : state === "error"
              ? error || "Something went wrong."
              : t("pay.demo")}
        </Alert>
      </div>
      <form className="mt-6 space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <TextField label={t("pay.card")} name="card" placeholder="4242 4242 4242 4242" />
        <div className="grid grid-cols-2 gap-3">
          <TextField label={t("pay.expiry")} name="expiry" placeholder="12/28" />
          <TextField label={t("pay.cvc")} name="cvc" placeholder="123" />
        </div>
        <TextField label={t("pay.name")} name="name" defaultValue={user.name ?? ""} />
        <button
          type="submit"
          disabled={state === "processing"}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-white disabled:opacity-60"
        >
          {state === "processing" ? "Processing…" : `Pay ${fee || formatFee(professional.fee)}`}
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
