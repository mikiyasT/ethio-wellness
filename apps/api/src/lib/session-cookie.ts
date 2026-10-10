import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

export const SESSION_COOKIE = "ayzon_session";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

export function newOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(provided: string, expected: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? "none" : "lax",
    path: "/",
    maxAge: SESSION_MS,
  };
}

export function readCookie(header: string | undefined, name: string) {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}
