import Stripe from "stripe";
import { env } from "../config/env.js";

let client: Stripe | null = null;

export function getStripe() {
  if (!env.stripeSecretKey) return null;
  if (!client) client = new Stripe(env.stripeSecretKey);
  return client;
}
