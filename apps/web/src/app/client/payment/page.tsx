"use client";

import { routes } from "@ethio-wellness/shared";
import { Alert } from "@/components/ui/alert";
import { resolveBookingContext } from "@/lib/booking";
import { fetchBooking, startCheckout } from "@/lib/bookings-api";
import { db, formatFee, type DbBooking, type DbProfessional } from "@/lib/db";
import { formatBookerLocal } from "@/lib/guest-booking";
import { useLocale } from "@/lib/locale";
import { trackPixel } from "@/lib/pixel";
import { fetchProfessionalBySlug, usePublicApi } from "@/lib/public-api";
import { useSession } from "@/lib/session";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

/**
 * Phase 1 Stripe Checkout (test mode) — simulated secure payment when Stripe
 * keys are not configured. Swap for Stripe Checkout Session redirect when
 * STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY are set (Phase 1.1).
 */
function ClientPaymentInner() {
  const { t } = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { role, user } = useSession();
  const [professional, setProfessional] = useState<DbProfessional | null>(null);
  const [hold, setHold] = useState<DbBooking | null>(null);
  const [dateLabel, setDateLabel] = useState("");
  const [fee, setFee] = useState("");
  const [state, setState] = useState<"idle" | "processing" | "failed" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      if (usePublicApi()) {
        const proSlug = search.get("pro");
        const holdId = search.get("hold");
        const pro = proSlug ? await fetchProfessionalBySlug(proSlug) : null;
        if (pro) {
          setProfessional(pro);
          setFee(formatFee(pro.fee));
        }
        if (holdId) {
          const found = await fetchBooking(holdId);
          if (found?.booking.status === "held") {
            setHold(found.booking);
            setProfessional(found.professional);
            setDateLabel(formatBookerLocal(found.booking.slotAt));
            setFee(formatFee(found.booking.fee));
            return;
          }
          setError("Your hold expired. Please pick the slot again.");
        }
        return;
      }
      await db.bookings.releaseExpiredHolds();
      const ctx = await resolveBookingContext(search.get("pro"), search.get("slot"));
      setProfessional(ctx.professional);
      setFee(ctx.fee);
      const holdId = search.get("hold");
      if (holdId) {
        const held = await db.bookings.getById(holdId);
        if (held?.status === "held") {
          setHold(held);
          setDateLabel(formatBookerLocal(held.slotAt));
          setFee(formatFee(held.fee));
          return;
        }
        setError("Your hold expired. Please pick the slot again.");
      }
      setDateLabel(ctx.dateLabel);
    })();
  }, [search]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!professional || !hold) {
      setError("Missing hold — go back and choose a slot.");
      setState("error");
      return;
    }
    if (role === "guest" && !hold.guestEmail) {
      setError("Guest details missing — go back one step.");
      setState("error");
      return;
    }

    setState("processing");
    setError("");

    if (usePublicApi()) {
      try {
        const checkout = await startCheckout(hold.id);
        window.location.assign(checkout.url);
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Payment could not be completed.");
      }
      return;
    }

    // Local pilot only: simulated payment when the API flag is off.
    window.setTimeout(() => {
      void (async () => {
        try {
          const confirmed = await db.bookings.confirmHold({
            bookingId: hold.id,
            paymentIntentId: `pi_test_${hold.id}`,
            clientId: role === "client" ? user.userId : undefined,
          });
          trackPixel("Purchase", { value: confirmed.fee, currency: confirmed.currency });
          router.push(`${routes.clientBookingConfirmation}?booking=${confirmed.id}`);
        } catch (err) {
          setState("error");
          setError(err instanceof Error ? err.message : "Payment could not be completed.");
        }
      })();
    }, 900);
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
        <p className="text-sm text-ink-2">
          Secure checkout (Stripe test mode). You will be charged{" "}
          <span className="font-semibold text-ink">{fee || formatFee(professional.fee)}</span> — the
          counselor’s session fee.
        </p>
        <button
          type="submit"
          disabled={state === "processing" || !hold}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-on-primary disabled:opacity-60"
        >
          {state === "processing"
            ? "Processing…"
            : `Pay ${fee || formatFee(professional.fee)} securely`}
        </button>
        <p className="text-xs text-ink-3">No account required. Card details are handled by Stripe in production.</p>
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
