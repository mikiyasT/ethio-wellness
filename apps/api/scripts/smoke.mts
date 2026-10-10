import { createHmac } from "node:crypto";
import { Prisma } from "@prisma/client";
import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

const API = process.env.SMOKE_API_URL ?? "http://localhost:4000";

function fail(step: string, detail: string): never {
  throw new Error(`${step}: ${detail}`);
}

async function call(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API}${path}`, init);
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }
  const setCookie =
    typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  const cookie = setCookie.map((part) => part.split(";")[0]).join("; ");
  return { status: response.status, body, cookie };
}

function asRecord(value: unknown, step: string) {
  if (!value || typeof value !== "object") fail(step, "expected a JSON object");
  return value as Record<string, unknown>;
}

async function main() {
  const stamp = Date.now();
  const email = `smoke-phase-f-${stamp}@example.com`;
  const guestEmail = `smoke-guest-${stamp}@example.com`;
  const password = `SmokePhaseF!${stamp}`;
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) fail("env", "ADMIN_TOKEN is not set");
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    fail("env", "STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are required");
  }

  let userId: string | null = null;
  let professionalId: string | null = null;

  try {
    const health = await call("/health");
    const healthBody = asRecord(health.body, "health");
    if (health.status !== 200 || healthBody.db !== "up") {
      fail("health", `status ${health.status}`);
    }
    console.log("health ok");

    const registered = await call("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Smoke Counselor",
        email,
        password,
        role: "professional",
      }),
    });
    const registeredUser = asRecord(asRecord(registered.body, "register").user, "register");
    if (registered.status !== 201 || registeredUser.professionalStatus !== "pending") {
      fail("register", `status ${registered.status}`);
    }
    userId = String(registeredUser.id);
    professionalId = String(registeredUser.professionalId);
    console.log("register ok");

    const loggedIn = await call("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (loggedIn.status !== 200 || !loggedIn.cookie) fail("login", `status ${loggedIn.status}`);
    const cookie = loggedIn.cookie;
    console.log("login ok");

    const mine = await call("/professionals/me", { headers: { Cookie: cookie } });
    const minePro = asRecord(asRecord(mine.body, "profile").professional, "profile");
    const slug = String(minePro.slug);
    if (mine.status !== 200 || !slug) fail("profile", `status ${mine.status}`);

    const hidden = await call(`/professionals/${encodeURIComponent(slug)}`);
    if (hidden.status !== 404) fail("pending-hidden", `status ${hidden.status}`);
    console.log("pending profile hidden");

    const approved = await call(`/admin/professionals/${professionalId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (approved.status !== 200) fail("approve", `status ${approved.status}`);
    const listed = await call(`/professionals/${encodeURIComponent(slug)}`);
    if (listed.status !== 200) fail("list", `status ${listed.status}`);
    console.log("approve and list ok");

    const startsAt = new Date(Date.now() + 200 * 24 * 60 * 60 * 1000);
    startsAt.setUTCMinutes(0, 0, 0);
    const slot = await prisma.slot.create({
      data: {
        professionalId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
        status: "open",
      },
    });

    const hold = await call("/bookings/holds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id }),
    });
    const holdBooking = asRecord(asRecord(hold.body, "hold").booking, "hold");
    if (hold.status !== 201 || holdBooking.status !== "held") fail("hold", `status ${hold.status}`);
    const bookingId = String(holdBooking.id);

    const second = await call("/bookings/holds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id }),
    });
    if (second.status !== 409) fail("second-hold", `status ${second.status}`);
    console.log("hold ok");

    const guest = await call(`/bookings/holds/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestFirstName: "Smoke",
        guestLastName: "Guest",
        guestEmail,
      }),
    });
    if (guest.status !== 200) fail("guest", `status ${guest.status}`);

    const checkout = await call(`/bookings/holds/${bookingId}/checkout`, { method: "POST" });
    const checkoutBody = asRecord(checkout.body, "checkout");
    if (checkout.status !== 200 || typeof checkoutBody.url !== "string" || !checkoutBody.url.includes("checkout.stripe.com")) {
      fail("checkout", `status ${checkout.status}`);
    }
    console.log("checkout ok");

    const stored = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { checkoutSessionId: true },
    });
    if (!stored?.checkoutSessionId) fail("checkout", "missing checkout session");

    const payload = JSON.stringify({
      id: `evt_smoke_${stamp}`,
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: stored.checkoutSessionId,
          object: "checkout.session",
          payment_status: "paid",
          client_reference_id: bookingId,
          metadata: { bookingId },
          payment_intent: `pi_smoke_${stamp}`,
        },
      },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET!)
      .update(`${timestamp}.${payload}`)
      .digest("hex");
    const webhook = await call("/stripe/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": `t=${timestamp},v1=${signature}`,
      },
      body: payload,
    });
    if (webhook.status !== 200) fail("webhook", `status ${webhook.status}`);

    const confirmed = await call(`/bookings/${bookingId}`);
    const confirmedBooking = asRecord(asRecord(confirmed.body, "confirm").booking, "confirm");
    if (confirmed.status !== 200 || confirmedBooking.status !== "upcoming" || !confirmedBooking.sessionCode) {
      fail("confirm", `status ${confirmed.status}`);
    }
    console.log("webhook confirm ok");

    const code = String(confirmedBooking.sessionCode);
    const join = await call(
      `/bookings/join?code=${encodeURIComponent(code)}&email=${encodeURIComponent(guestEmail)}`,
    );
    const joinBooking = asRecord(asRecord(join.body, "join").booking, "join");
    if (join.status !== 200 || joinBooking.id !== bookingId) fail("join", `status ${join.status}`);
    console.log("join ok");

    try {
      await prisma.booking.create({
        data: {
          professionalId,
          slotId: slot.id,
          specialty: "individual-mental-health",
          feeCents: 2500,
          status: "upcoming",
          guestEmail,
        },
      });
      fail("conflict", "a second upcoming booking was stored");
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    }
    console.log("second upcoming booking rejected");
    console.log("smoke passed");
  } finally {
    if (professionalId) {
      await prisma.booking.deleteMany({ where: { professionalId } });
      await prisma.slot.deleteMany({ where: { professionalId } });
    }
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  }
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : "smoke failed");
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
