import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(16),
  ADMIN_TOKEN: z.string().min(16),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PUBLIC_WEB_URL: z.string().default("http://localhost:3000"),
  EMAIL_FROM: z.string().default("Ayzon <bookings@ayzoncare.com>"),
  RESEND_API_KEY: z.string().optional(),
  POSTMARK_SERVER_TOKEN: z.string().optional(),
  DAILY_API_KEY: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid API environment:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid API environment");
}

if (process.env.NODE_ENV === "production" && parsed.data.COOKIE_SECURE !== "true") {
  console.warn(
    "COOKIE_SECURE must be true in production so the session cookie is Secure and SameSite=None. The web app and API must both be HTTPS.",
  );
}

if (!parsed.data.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set. Checkout cannot start.");
} else if (!parsed.data.STRIPE_WEBHOOK_SECRET) {
  console.warn("STRIPE_WEBHOOK_SECRET is not set. Checkout can start, but payment will not confirm until the webhook secret is set.");
}

const corsOrigins = parsed.data.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  directUrl: parsed.data.DIRECT_URL ?? parsed.data.DATABASE_URL,
  sessionSecret: parsed.data.SESSION_SECRET,
  adminToken: parsed.data.ADMIN_TOKEN,
  corsOrigins,
  cookieSecure: parsed.data.COOKIE_SECURE === "true",
  stripeSecretKey: parsed.data.STRIPE_SECRET_KEY,
  stripeWebhookSecret: parsed.data.STRIPE_WEBHOOK_SECRET,
  publicWebUrl: parsed.data.PUBLIC_WEB_URL,
  emailFrom: parsed.data.EMAIL_FROM,
  resendApiKey: parsed.data.RESEND_API_KEY,
  postmarkToken: parsed.data.POSTMARK_SERVER_TOKEN,
  dailyApiKey: parsed.data.DAILY_API_KEY,
};
