import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BRAND_FROM, BRAND_REPLY_TO, formatWhen, fromAddress, renderMailHtml, withBrandFooter } from "../src/lib/mail.ts";

describe("email brand", () => {
  it("sends from the Amharic name and replies to support", () => {
    assert.equal(BRAND_FROM, "አይዞን <bookings@ayzoncare.com>");
    assert.equal(fromAddress(), BRAND_FROM);
    assert.equal(BRAND_FROM.includes("Ayzon"), false);
    assert.equal(BRAND_REPLY_TO, "support@ayzoncare.com");
  });

  it("closes plain text with the sign-off and the site", () => {
    const text = withBrandFooter("Join: https://ayzoncare.com/join?code=AYZ-TEST");
    assert.match(text, /አይዞን!\nayzoncare.com$/);
  });

  it("renders HTML with a prominent sign-off and no webfont", () => {
    const html = renderMailHtml("Join: https://ayzoncare.com/join?code=AYZ-TEST");
    assert.match(html, /አይዞን!/);
    assert.match(html, /font-size:12px;color:#78716c;/);
    assert.equal(html.includes("fonts.googleapis"), false);
    assert.equal(html.includes("@font-face"), false);
    assert.match(html, /href="https:\/\/ayzoncare.com\/join\?code=AYZ-TEST"/);
  });

  it("labels Addis Ababa times as EAT", () => {
    const label = formatWhen(new Date("2026-10-12T03:40:00.000Z"), "Africa/Addis_Ababa");
    assert.match(label, /6:40 AM EAT$/);
  });
});
