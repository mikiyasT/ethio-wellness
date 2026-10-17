import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { bilingualBioErrors } from "@ethio-wellness/shared";
import { createApp } from "../src/app.ts";
import { prisma } from "../src/lib/prisma.ts";

const ENGLISH =
  "I help adults work through anxiety and life changes with care, patience, and a clear plan.";
const AMHARIC =
  "በሙያዬ ሰዎችን በጭንቀት እና በሕይወት ለውጥ እደግፋለሁ። ይህን ሥራ በትዕግስት እና በአክብሮት አደርጋለሁ።";
const TIGRINYA =
  "ብሙያይ ሰባት ኣብ ጭንቀትን ለውጢ ህይወትን እሕግዞም። ነዚ ስራሕ ብትዕግስቲን ኣኽብሮትን እገብሮ።";
const OROMO =
  "Ani namoota dhiphina fi jijjiirama jireenyaa keessatti deeggara. Hojii kana obsaan fi kabajaa raawwadha.";

function issues(input: {
  about?: string;
  aboutTranslated?: string;
  aboutTranslatedLang?: "am" | "om" | "ti" | "";
  languages?: ("amharic" | "tigrinya" | "afaan-oromoo" | "english")[];
}) {
  return bilingualBioErrors({
    about: input.about ?? ENGLISH,
    aboutTranslated: input.aboutTranslated ?? AMHARIC,
    aboutTranslatedLang: input.aboutTranslatedLang ?? "am",
    languages: input.languages ?? ["amharic", "english"],
  }).map((error) => error.issue);
}

describe("bilingual bio rules", () => {
  it("accepts English plus each second language", () => {
    assert.deepEqual(issues({ aboutTranslatedLang: "am", languages: ["amharic", "english"] }), []);
    assert.deepEqual(
      issues({ aboutTranslated: TIGRINYA, aboutTranslatedLang: "ti", languages: ["tigrinya", "english"] }),
      [],
    );
    assert.deepEqual(
      issues({ aboutTranslated: OROMO, aboutTranslatedLang: "om", languages: ["afaan-oromoo"] }),
      [],
    );
  });

  it("requires a non-English language", () => {
    assert.deepEqual(issues({ languages: ["english"] }), ["non_english_required"]);
  });

  it("requires the second bio language to be one the provider offers", () => {
    const errors = bilingualBioErrors({
      about: ENGLISH,
      aboutTranslated: TIGRINYA,
      aboutTranslatedLang: "ti",
      languages: ["amharic", "english"],
    });
    assert.equal(errors[0]?.issue, "translated_language_mismatch");
    assert.equal(errors[0]?.message, "Your second bio language must be one of the languages you offer.");
  });

  it("rejects empty, short, and long bios", () => {
    assert.ok(issues({ about: "" }).includes("about_required"));
    assert.ok(issues({ about: "Too short for a public bio." }).includes("about_too_short"));
    assert.ok(issues({ about: "a".repeat(1001) }).includes("about_too_long"));
    assert.ok(issues({ aboutTranslated: "" }).includes("translated_required"));
    assert.ok(issues({ aboutTranslated: "short" }).includes("translated_too_short"));
    assert.ok(issues({ aboutTranslated: "b".repeat(1001) }).includes("translated_too_long"));
  });
});

describe("bilingual bio API", () => {
  let server: Server;
  let base = "";
  let userId = "";
  let cookie = "";

  before(async () => {
    server = createServer(createApp());
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("test server has no port");
    base = `http://127.0.0.1:${address.port}`;
    const stamp = Date.now();
    const email = `bilingual-${stamp}@example.com`;
    const password = `Bilingual!${stamp}`;
    const registered = await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bilingual Pro", email, password, role: "professional" }),
    });
    const created = (await registered.json()) as { user: { id: string } };
    assert.equal(registered.status, 201);
    userId = created.user.id;
    const loggedIn = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    cookie = loggedIn.headers.getSetCookie().map((part) => part.split(";")[0]).join("; ");
    assert.equal(loggedIn.status, 200);
  });

  after(async () => {
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await prisma.$disconnect();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function patch(body: Record<string, unknown>) {
    const response = await fetch(`${base}/professionals/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    });
    const json = (await response.json()) as {
      error?: string;
      professional?: { about: string; aboutTranslated: string | null; aboutTranslatedLang: string | null; bio: string };
    };
    return { status: response.status, json };
  }

  it("stores the English bio and the Amharic translation", async () => {
    const saved = await patch({
      about: ENGLISH,
      aboutTranslated: AMHARIC,
      aboutTranslatedLang: "am",
      languages: ["amharic", "english"],
      specialties: ["individual-mental-health"],
    });
    assert.equal(saved.status, 200);
    assert.equal(saved.json.professional?.bio, ENGLISH);
    assert.equal(saved.json.professional?.about, ENGLISH);
    assert.equal(saved.json.professional?.aboutTranslated, AMHARIC);
    assert.equal(saved.json.professional?.aboutTranslatedLang, "am");

    const stored = await prisma.professional.findUnique({ where: { userId } });
    assert.equal(stored?.bio, ENGLISH);
    assert.equal(stored?.aboutTranslated, AMHARIC);
    assert.equal(stored?.aboutTranslatedLang, "am");
  });

  it("stores Tigrinya and Afaan Oromo language codes", async () => {
    const tigrinya = await patch({
      about: ENGLISH,
      aboutTranslated: TIGRINYA,
      aboutTranslatedLang: "ti",
      languages: ["tigrinya", "english"],
    });
    assert.equal(tigrinya.status, 200);
    assert.equal(tigrinya.json.professional?.aboutTranslatedLang, "ti");

    const oromo = await patch({
      about: ENGLISH,
      aboutTranslated: OROMO,
      aboutTranslatedLang: "om",
      languages: ["afaan-oromoo", "english"],
    });
    assert.equal(oromo.status, 200);
    assert.equal(oromo.json.professional?.aboutTranslatedLang, "om");
  });

  it("rejects a second language the provider does not offer", async () => {
    const rejected = await patch({
      about: ENGLISH,
      aboutTranslated: TIGRINYA,
      aboutTranslatedLang: "ti",
      languages: ["amharic", "english"],
    });
    assert.equal(rejected.status, 400);
    assert.equal(rejected.json.error, "translated_language_mismatch");
  });
});
