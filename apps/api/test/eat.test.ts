import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addCalendarDays, eatDateIso, MIN_LEAD_DAYS, minOpenDate, startsAtFromEat } from "../src/lib/eat.ts";

describe("East Africa Time lead window", () => {
  it("treats 21:00 UTC as midnight in Addis, and the minute before as the previous day", () => {
    const justBeforeMidnight = new Date("2026-10-09T20:59:59.999Z");
    const midnight = new Date("2026-10-09T21:00:00.000Z");

    assert.equal(eatDateIso(justBeforeMidnight), "2026-10-09");
    assert.equal(eatDateIso(midnight), "2026-10-10");
    assert.equal(minOpenDate(justBeforeMidnight), "2026-10-11");
    assert.equal(minOpenDate(midnight), "2026-10-12");
    assert.equal(MIN_LEAD_DAYS, 2);
  });

  it("uses Oct 12 as the earliest open date when today in Addis is Oct 10", () => {
    const noonOnOct10 = new Date("2026-10-10T09:00:00.000Z");
    assert.equal(eatDateIso(noonOnOct10), "2026-10-10");
    assert.equal(minOpenDate(noonOnOct10), "2026-10-12");
  });

  it("keeps 12:00 AM on the earliest day, and rejects the last hour of the day before", () => {
    const now = new Date("2026-10-09T21:00:00.000Z");
    const earliest = minOpenDate(now);
    const firstAllowed = startsAtFromEat(earliest, "12:00 AM");
    const lastRejected = startsAtFromEat(addCalendarDays(earliest, -1), "11:00 PM");

    assert.ok(firstAllowed);
    assert.ok(lastRejected);
    assert.equal(eatDateIso(firstAllowed), earliest);
    assert.equal(eatDateIso(lastRejected) < earliest, true);
    assert.equal(firstAllowed.toISOString(), "2026-10-11T21:00:00.000Z");
  });
});
