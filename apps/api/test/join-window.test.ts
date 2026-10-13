import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CHANGE_LEAD_MS, guestCanChange, JOIN_LEAD_MS, joinPhase } from "../src/lib/join-window.ts";

const start = new Date("2026-10-20T15:00:00.000Z");
const end = new Date(start.getTime() + 60 * 60 * 1000);

describe("join window", () => {
  it("stays closed until 15 minutes before the start", () => {
    const justBefore = new Date(start.getTime() - JOIN_LEAD_MS - 1);
    assert.equal(joinPhase(start, end, justBefore), "soon");
    assert.equal(joinPhase(start, end, new Date(start.getTime() - JOIN_LEAD_MS)), "open");
  });

  it("closes when the session ends", () => {
    assert.equal(joinPhase(start, end, new Date(end.getTime())), "open");
    assert.equal(joinPhase(start, end, new Date(end.getTime() + 1)), "ended");
  });
});

describe("24 hour guest change rule", () => {
  it("lets a guest change only when the session is more than 24 hours away", () => {
    const now = new Date("2026-10-11T15:00:00.000Z");
    assert.equal(guestCanChange(new Date(now.getTime() + CHANGE_LEAD_MS + 1), now), true);
    assert.equal(guestCanChange(new Date(now.getTime() + CHANGE_LEAD_MS), now), false);
    assert.equal(guestCanChange(new Date(now.getTime() + 60 * 60 * 1000), now), false);
  });
});
