import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveApiBase } from "./api-base.ts";

const configured = "https://api.example.com";

describe("API base", () => {
  it("uses the configured Railway URL on the public site", () => {
    assert.equal(
      resolveApiBase({
        configured,
        hostname: "app.ayzoncare.com",
        protocol: "https:",
        origin: "https://app.ayzoncare.com",
      }),
      configured,
    );
  });

  it("keeps the laptop tunnel on the local proxy", () => {
    assert.equal(
      resolveApiBase({
        configured,
        hostname: "random-name.trycloudflare.com",
        protocol: "https:",
        origin: "https://random-name.trycloudflare.com",
      }),
      "https://random-name.trycloudflare.com/backend",
    );
  });

  it("uses port 4000 for a phone on the same Wi-Fi", () => {
    assert.equal(
      resolveApiBase({
        configured: "http://localhost:4000",
        hostname: "192.168.1.174",
        protocol: "http:",
        origin: "http://192.168.1.174:3000",
      }),
      "http://192.168.1.174:4000",
    );
  });

  it("uses the configured URL on localhost and on the server", () => {
    assert.equal(
      resolveApiBase({
        configured,
        hostname: "localhost",
        protocol: "http:",
        origin: "http://localhost:3000",
      }),
      configured,
    );
    assert.equal(resolveApiBase({ configured, hostname: null, protocol: null, origin: null }), configured);
  });
});
