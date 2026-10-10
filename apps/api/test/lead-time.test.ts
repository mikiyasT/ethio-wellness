import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { createApp } from "../src/app.ts";
import { addCalendarDays, eatDateIso, minOpenDate, startsAtFromEat } from "../src/lib/eat.ts";
import { prisma } from "../src/lib/prisma.ts";

describe("availability lead time", () => {
  let server: Server;
  let base = "";
  let userId = "";
  let professionalId = "";
  let cookie = "";

  before(async () => {
    server = createServer(createApp());
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("test server has no port");
    base = `http://127.0.0.1:${address.port}`;

    const stamp = Date.now();
    const email = `lead-time-${stamp}@example.com`;
    const password = `LeadTime!${stamp}`;
    const registered = await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Lead Time", email, password, role: "professional" }),
    });
    const created = (await registered.json()) as {
      user: { id: string; professionalId: string };
    };
    assert.equal(registered.status, 201);
    userId = created.user.id;
    professionalId = created.user.professionalId;

    const approved = await fetch(`${base}/admin/professionals/${professionalId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
    });
    assert.equal(approved.status, 200);

    const loggedIn = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    cookie = loggedIn.headers.getSetCookie().map((part) => part.split(";")[0]).join("; ");
    assert.equal(loggedIn.status, 200);
    assert.ok(cookie);
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

  async function putHours(hours: { date: string; time: string }[]) {
    const response = await fetch(`${base}/availability/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ hours }),
    });
    const body = (await response.json()) as { error?: string; minDate?: string; slots?: unknown[] };
    return { status: response.status, body };
  }

  it("rejects tomorrow and accepts the first allowed day", async () => {
    const today = eatDateIso(new Date());
    const tomorrow = addCalendarDays(today, 1);
    const earliest = minOpenDate();

    const tooSoon = await putHours([{ date: tomorrow, time: "10:00 AM" }]);
    assert.equal(tooSoon.status, 400);
    assert.equal(tooSoon.body.error, "availability_too_soon");
    assert.equal(tooSoon.body.minDate, earliest);
    assert.equal(await prisma.slot.count({ where: { professionalId } }), 0);

    const mixed = await putHours([
      { date: tomorrow, time: "11:00 AM" },
      { date: earliest, time: "10:00 AM" },
    ]);
    assert.equal(mixed.status, 400);
    assert.equal(mixed.body.error, "availability_too_soon");
    assert.equal(await prisma.slot.count({ where: { professionalId } }), 0);

    const allowed = await putHours([{ date: earliest, time: "10:00 AM" }]);
    assert.equal(allowed.status, 200);
    const saved = await prisma.slot.findMany({ where: { professionalId } });
    assert.equal(saved.length, 1);
    assert.equal(eatDateIso(saved[0]!.startsAt), earliest);
  });

  it("rejects a hold on a slot dated tomorrow in East Africa Time", async () => {
    const tomorrow = addCalendarDays(eatDateIso(new Date()), 1);
    const startsAt = startsAtFromEat(tomorrow, "4:00 PM");
    assert.ok(startsAt);
    const slot = await prisma.slot.create({
      data: {
        professionalId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
        status: "open",
      },
    });

    const response = await fetch(`${base}/bookings/holds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id }),
    });
    const body = (await response.json()) as { error?: string };
    assert.equal(response.status, 409);
    assert.equal(body.error, "slot_too_soon");

    const stored = await prisma.slot.findUnique({ where: { id: slot.id } });
    assert.equal(stored?.status, "open");
  });
});
