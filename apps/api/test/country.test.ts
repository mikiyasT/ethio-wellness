import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { createApp } from "../src/app.ts";
import { addCalendarDays, eatDateIso, minOpenDate, startsAtFromEat } from "../src/lib/eat.ts";
import { prisma } from "../src/lib/prisma.ts";

const LAGOS = "Africa/Lagos";
const ADDIS = "Africa/Addis_Ababa";

describe("professional country and timezone", () => {
  let server: Server;
  let base = "";
  let userId = "";
  let professionalId = "";
  let cookie = "";
  let slug = "";

  before(async () => {
    server = createServer(createApp());
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("test server has no port");
    base = `http://127.0.0.1:${address.port}`;

    const stamp = Date.now();
    const email = `country-${stamp}@example.com`;
    const password = `Country!${stamp}`;
    const registered = await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Country Pro", email, password, role: "professional" }),
    });
    const created = (await registered.json()) as { user: { id: string; professionalId: string } };
    assert.equal(registered.status, 201);
    userId = created.user.id;
    professionalId = created.user.professionalId;

    const loggedIn = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    cookie = loggedIn.headers.getSetCookie().map((part) => part.split(";")[0]).join("; ");
    assert.equal(loggedIn.status, 200);
  });

  after(async () => {
    if (professionalId) {
      await prisma.booking.deleteMany({ where: { professionalId } });
      await prisma.slot.deleteMany({ where: { professionalId } });
    }
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await prisma.$disconnect();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function patchMe(body: Record<string, unknown>) {
    const response = await fetch(`${base}/professionals/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    });
    const json = (await response.json()) as {
      error?: string;
      professional?: { country: string; timezone: string; slug: string };
    };
    return { status: response.status, json };
  }

  it("defaults new professionals to Ethiopia and Addis Ababa", async () => {
    const response = await fetch(`${base}/professionals/me`, { headers: { Cookie: cookie } });
    const body = (await response.json()) as { professional: { country: string; timezone: string; slug: string } };
    assert.equal(response.status, 200);
    assert.equal(body.professional.country, "ET");
    assert.equal(body.professional.timezone, ADDIS);
    slug = body.professional.slug;
  });

  it("rejects an unknown country and an unknown timezone", async () => {
    const country = await patchMe({ country: "ZZ" });
    assert.equal(country.status, 400);
    assert.equal(country.json.error, "invalid_country");

    const timezone = await patchMe({ timezone: "Not/AZone" });
    assert.equal(timezone.status, 400);
    assert.equal(timezone.json.error, "invalid_timezone");
  });

  it("derives the timezone when onboarding sends only a country", async () => {
    const nigeria = await patchMe({ country: "NG" });
    assert.equal(nigeria.status, 200);
    assert.equal(nigeria.json.professional?.country, "NG");
    assert.equal(nigeria.json.professional?.timezone, LAGOS);

    const again = await fetch(`${base}/professionals/me`, { headers: { Cookie: cookie } });
    const stored = (await again.json()) as { professional: { country: string; timezone: string } };
    assert.equal(stored.professional.country, "NG");
    assert.equal(stored.professional.timezone, LAGOS);

    const ethiopia = await patchMe({ country: "ET" });
    assert.equal(ethiopia.status, 200);
    assert.equal(ethiopia.json.professional?.country, "ET");
    assert.equal(ethiopia.json.professional?.timezone, ADDIS);
  });

  it("includes country on the public profile and directory", async () => {
    const approved = await fetch(`${base}/admin/professionals/${professionalId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    assert.equal(approved.status, 200);
    await patchMe({ country: "NG" });

    const profile = await fetch(`${base}/professionals/${slug}`);
    const profileBody = (await profile.json()) as { professional: { country: string } };
    assert.equal(profile.status, 200);
    assert.equal(profileBody.professional.country, "NG");

    const directory = await fetch(`${base}/professionals`);
    const listed = (await directory.json()) as { professionals: { slug: string; country: string }[] };
    const row = listed.professionals.find((item) => item.slug === slug);
    assert.equal(row?.country, "NG");
  });

  it("applies the lead-time rule in the professional timezone", async () => {
    const nigeria = await patchMe({ country: "NG" });
    assert.equal(nigeria.json.professional?.timezone, LAGOS);
    const today = eatDateIso(new Date(), LAGOS);
    const tomorrow = addCalendarDays(today, 1);
    const earliest = minOpenDate(new Date(), LAGOS);

    const tooSoon = await fetch(`${base}/availability/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ hours: [{ date: tomorrow, time: "10:00 AM" }] }),
    });
    const tooSoonBody = (await tooSoon.json()) as { error?: string; minDate?: string };
    assert.equal(tooSoon.status, 400);
    assert.equal(tooSoonBody.error, "availability_too_soon");
    assert.equal(tooSoonBody.minDate, earliest);

    const allowed = await fetch(`${base}/availability/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ hours: [{ date: earliest, time: "10:00 AM" }] }),
    });
    assert.equal(allowed.status, 200);
    const saved = await prisma.slot.findFirst({
      where: { professionalId, status: "open" },
      orderBy: { startsAt: "desc" },
    });
    const lagosInstant = startsAtFromEat(earliest, "10:00 AM", LAGOS);
    const addisInstant = startsAtFromEat(earliest, "10:00 AM", ADDIS);
    assert.ok(saved);
    assert.ok(lagosInstant);
    assert.ok(addisInstant);
    assert.equal(saved.startsAt.toISOString(), lagosInstant.toISOString());
    assert.notEqual(lagosInstant.toISOString(), addisInstant.toISOString());

    const holdStart = startsAtFromEat(tomorrow, "4:00 PM", LAGOS);
    assert.ok(holdStart);
    const slot = await prisma.slot.create({
      data: {
        professionalId,
        startsAt: holdStart,
        endsAt: new Date(holdStart.getTime() + 60 * 60 * 1000),
        status: "open",
      },
    });
    const hold = await fetch(`${base}/bookings/holds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id }),
    });
    const holdBody = (await hold.json()) as { booking?: { id: string }; error?: string };
    assert.equal(hold.status, 201);
    assert.ok(holdBody.booking?.id);
    const stored = await prisma.slot.findUnique({ where: { id: slot.id } });
    assert.equal(stored?.status, "held");
  });
});
