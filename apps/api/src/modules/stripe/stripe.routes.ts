import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { getStripe } from "../../lib/stripe.js";
import { confirmPaidCheckout, paymentIntentIdOf } from "../bookings/bookings.service.js";

/** Stripe is the only path that turns a hold into an upcoming booking. */
export async function stripeWebhook(req: Request, res: Response) {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    res.status(503).json({ error: "stripe_unavailable" });
    return;
  }
  const signature = req.header("stripe-signature");
  if (!signature || !Buffer.isBuffer(req.body)) {
    res.status(400).json({ error: "invalid_signature" });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch {
    res.status(400).json({ error: "invalid_signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId || session.client_reference_id;
    if (session.payment_status === "paid" && bookingId) {
      const outcome = await confirmPaidCheckout({
        bookingId,
        checkoutSessionId: session.id,
        paymentIntentId: paymentIntentIdOf(session),
      });
      if (outcome === "rejected" || outcome === "missing") {
        console.warn(`Stripe checkout ${session.id} did not confirm booking ${bookingId} (${outcome})`);
      }
    }
  }

  res.json({ received: true });
}
