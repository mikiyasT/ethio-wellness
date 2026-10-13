import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { env } from "../config/env.js";

let cachedKey: Buffer | null = null;

function key() {
  if (!cachedKey) cachedKey = scryptSync(env.sessionSecret, "ayzon-manage-token", 32);
  return cachedKey;
}

/** Encrypt the raw manage token so reminder and retry mail can rebuild /b/<token> without storing it in plaintext. */
export function sealToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function openToken(sealed: string) {
  const raw = Buffer.from(sealed, "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
