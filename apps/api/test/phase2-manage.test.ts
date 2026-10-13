import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.ts";
import { hashToken, newOpaqueToken } from "../src/lib/session-cookie.ts";
import { sealToken } from "../src/lib/token-seal.ts";
import { getManagedBooking, manageCancel, startGuestVideo } from "../src/modules/bookings/bookings.service.ts";

describe("phase 2 manage link", () => {
  let userId = "";
  let professionalId = "";
  const slotIds: string[] = [];
  const bookingIds: string[] = [];

  before(async () => {
    const stamp = Date.now();
    const user = await prisma.user.create({
      data: {
        name: "Phase Two Pro",
        email: `phase2-${stamp}@example.com`,
        passwordHash: await bcrypt.hash("Phase2!test", 4),
        role: "professional",
      },
    });
    userId = user.id;
    const professional = await prisma.professional.create({
      data: {
        userId: user.id,
        slug: `phase2-${stamp}`,
        name: "Phase Two Pro",
        title: "Counselor",
        city: "Addis Ababa",
        bio: "Test",
        languages: ["en"],
        specialties: ["individual-mental-health"],
        feeCents: 2500,
        avatarClass: "bg-teal",
        initials: "PT",
        status: "approved",
      },
    });
    professionalId = professional.id;
  });

  after(async () => {
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await prisma.slot.deleteMany({ where: { id: { in: slotIds } } });
    if (professionalId) await prisma.professional.delete({ where: { id: professionalId } }).catch(() => undefined);
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
  });

  async function book(startsAt: Date, code: string) {
    const slot = await prisma.slot.create({
      data: {
        professionalId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
        status: "booked",
      },
    });
    slotIds.push(slot.id);
    const token = newOpaqueToken();
    const booking = await prisma.booking.create({
      data: {
        professionalId,
        slotId: slot.id,
        specialty: "individual-mental-health",
        feeCents: 2500,
        status: "upcoming",
        sessionCode: code,
        guestEmail: "guest-phase2@example.com",
        guestFirstName: "Abel",
        manageTokenHash: hashToken(token),
        manageTokenSeal: sealToken(token),
      },
    });
    bookingIds.push(booking.id);
    return token;
  }

  it("cancels immediately when the session is more than 24 hours away", async () => {
    const token = await book(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), `AYZ-P2${String(Date.now()).slice(-2)}A`);
    const before = await getManagedBooking(token);
    assert.equal(before.guestCanChange, true);
    const result = await manageCancel(token);
    assert.equal(result.pending, false);
    assert.equal(result.booking.status, "cancelled");
  });

  it("asks the professional when the session is inside 24 hours", async () => {
    const token = await book(new Date(Date.now() + 2 * 60 * 60 * 1000), `AYZ-P2${String(Date.now()).slice(-2)}B`);
    const result = await manageCancel(token);
    assert.equal(result.pending, true);
    assert.equal(result.booking.status, "upcoming");
    assert.equal(result.booking.changeRequest, "cancel");
  });

  it("refuses video outside the join window", async () => {
    await book(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), "AYZ-P2VC");
    await assert.rejects(() => startGuestVideo("AYZ-P2VC", "guest-phase2@example.com"), (error: unknown) => {
      assert.equal((error as { code?: string }).code, "join_closed");
      return true;
    });
  });
});
