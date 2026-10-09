import { Router } from "express";
import { z } from "zod";
import { readCookie, SESSION_COOKIE, clearSessionCookie, setSessionCookie } from "../../lib/session-cookie.js";
import {
  AuthError,
  createSession,
  deleteSession,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  userForSessionToken,
} from "./auth.service.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  role: z.enum(["client", "professional"]),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

const forgotSchema = z.object({
  email: z.string().trim().email().max(200),
});

const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(200),
});

function sendAuthError(res: { status: (code: number) => { json: (body: unknown) => void } }, error: unknown) {
  if (error instanceof AuthError) {
    res.status(error.status).json({ error: error.code });
    return true;
  }
  return false;
}

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const user = await registerUser(parsed.data);
    const token = await createSession(user.id);
    setSessionCookie(res, token);
    res.status(201).json({ user });
  } catch (error) {
    if (!sendAuthError(res, error)) throw error;
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const user = await loginUser(parsed.data.email, parsed.data.password);
    const token = await createSession(user.id);
    setSessionCookie(res, token);
    res.json({ user });
  } catch (error) {
    if (!sendAuthError(res, error)) throw error;
  }
});

authRouter.post("/logout", async (req, res) => {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE);
  await deleteSession(token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", async (req, res) => {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE);
  const user = await userForSessionToken(token);
  if (!user) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  res.json({ user });
});

authRouter.post("/forgot-password", async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  await requestPasswordReset(parsed.data.email);
  res.json({ ok: true });
});

authRouter.post("/reset-password", async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    await resetPassword(parsed.data.token, parsed.data.password);
    res.json({ ok: true });
  } catch (error) {
    if (!sendAuthError(res, error)) throw error;
  }
});
