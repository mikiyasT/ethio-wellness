import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { metaPixelId } from "./pixel-id.ts";

describe("Meta pixel id", () => {
  it("accepts a numeric id and rejects anything else", () => {
    assert.equal(metaPixelId("1234567890"), "1234567890");
    assert.equal(metaPixelId(" 12345 "), "12345");
    assert.equal(metaPixelId(""), "");
    assert.equal(metaPixelId("123;alert(1)"), "");
    assert.equal(metaPixelId(undefined), "");
  });
});
