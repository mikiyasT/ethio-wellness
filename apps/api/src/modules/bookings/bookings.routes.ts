import { Router } from "express";
import { z } from "zod";
import { allowRequest, clientAddress } from "../../lib/rate-limit.js";
import { readCookie, SESSION_COOKIE } from "../../lib/session-cookie.js";
import { AuthError, professionalFromCookie, userForSessionToken } from "../auth/auth.service.js";
import {
  BookingError,
  cancelBooking,
  claimableCount,
  claimGuestBookings,
  createHold,
  decideChange,
  findJoinBooking,
  getBooking,
  getManagedBooking,
  listForProfessional,
  listMine,
  manageCancel,
  manageReschedule,
  startCheckout,
  startGuestVideo,
  startProfessionalVideo,
  updateHoldGuest,
} from "./bookings.service.js";

export const bookingsRouter = Router();

const holdSchema = z.object({
  slotId: z.string().min(1),
});

const guestSchema = z.object({
  guestFirstName: z.string().trim().max(80).optional(),
  guestLastName: z.string().trim().max(80).optional(),
  guestEmail: z.string().trim().email().optional(),
  guestPhone: z.string().trim().max(40).optional(),
  guestNote: z.string().trim().max(1000).optional(),
  bookerTimeZone: z.string().trim().min(1).max(80).optional(),
});

const LIMIT_WINDOW_MS = 10 * 60 * 1000;

function sendError(res: { status: (code: number) => { json: (body: unknown) => void } }, error: unknown) {
  if (error instanceof BookingError || error instanceof AuthError) {
    res.status(error.status).json({ error: error.code });
    return true;
  }
  return false;
}

function limited(
  req: { ip?: string; socket: { remoteAddress?: string | null } },
  res: { status: (code: number) => { json: (body: unknown) => void } },
  bucket: string,
  limit: number,
) {
  if (allowRequest(`${bucket}:${clientAddress(req)}`, limit, LIMIT_WINDOW_MS)) return false;
  res.status(429).json({ error: "rate_limited" });
  return true;
}

bookingsRouter.post("/holds", async (req, res) => {
  if (limited(req, res, "hold", 20)) return;
  const parsed = holdSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const user = await userForSessionToken(readCookie(req.headers.cookie, SESSION_COOKIE));
    const booking = await createHold(parsed.data.slotId, user?.role === "client" ? user.id : undefined);
    res.status(201).json({ booking });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.patch("/holds/:id", async (req, res) => {
  const parsed = guestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const user = await userForSessionToken(readCookie(req.headers.cookie, SESSION_COOKIE));
    const client = user?.role === "client" ? user : undefined;
    const booking = await updateHoldGuest(req.params.id, parsed.data, client);
    res.json({ booking });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.post("/holds/:id/checkout", async (req, res) => {
  if (limited(req, res, "checkout", 10)) return;
  try {
    const checkout = await startCheckout(req.params.id);
    res.json(checkout);
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.get("/join", async (req, res) => {
  if (limited(req, res, "join", 30)) return;
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const email = typeof req.query.email === "string" ? req.query.email : "";
  if (!code || !email) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const codeKey = code.trim().toUpperCase();
  if (!allowRequest(`join-code:${codeKey}`, 8, LIMIT_WINDOW_MS)) {
    res.status(429).json({ error: "rate_limited" });
    return;
  }
  try {
    const booking = await findJoinBooking(code, email);
    if (!booking) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ booking });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.post("/join/video", async (req, res) => {
  const code = typeof req.body?.code === "string" ? req.body.code : "";
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  if (!code || !email) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const codeKey = code.trim().toUpperCase();
  if (!allowRequest(`join-video:${codeKey}`, 8, LIMIT_WINDOW_MS)) {
    res.status(429).json({ error: "rate_limited" });
    return;
  }
  try {
    const video = await startGuestVideo(code, email);
    res.json(video);
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.get("/claimable", async (req, res) => {
  try {
    const user = await userForSessionToken(readCookie(req.headers.cookie, SESSION_COOKIE));
    if (!user) throw new AuthError(401, "unauthenticated");
    if (user.role !== "client") throw new AuthError(403, "forbidden");
    const count = await claimableCount(user.email);
    res.json({ count });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.post("/claim", async (req, res) => {
  try {
    const user = await userForSessionToken(readCookie(req.headers.cookie, SESSION_COOKIE));
    if (!user) throw new AuthError(401, "unauthenticated");
    if (user.role !== "client") throw new AuthError(403, "forbidden");
    const claimed = await claimGuestBookings(user.id, user.email);
    res.json({ claimed });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.get("/manage/:token", async (req, res) => {
  try {
    const managed = await getManagedBooking(req.params.token);
    res.json(managed);
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.post("/manage/:token/cancel", async (req, res) => {
  try {
    const result = await manageCancel(req.params.token);
    res.json(result);
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.post("/manage/:token/reschedule", async (req, res) => {
  const slotId = typeof req.body?.slotId === "string" ? req.body.slotId : "";
  if (!slotId) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const result = await manageReschedule(req.params.token, slotId);
    res.json(result);
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.get("/mine", async (req, res) => {
  try {
    const user = await userForSessionToken(readCookie(req.headers.cookie, SESSION_COOKIE));
    if (!user) throw new AuthError(401, "unauthenticated");
    if (user.role !== "client") throw new AuthError(403, "forbidden");
    const bookings = await listMine(user.id);
    res.json({ bookings });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.get("/professional", async (req, res) => {
  try {
    const user = await professionalFromCookie(req.headers.cookie);
    const bookings = await listForProfessional(user.professionalId!);
    res.json({ bookings });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.get("/:id", async (req, res) => {
  try {
    const booking = await getBooking(req.params.id);
    if (!booking) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ booking });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.post("/:id/video", async (req, res) => {
  try {
    const user = await professionalFromCookie(req.headers.cookie);
    const video = await startProfessionalVideo(req.params.id, user.professionalId!);
    res.json(video);
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.post("/:id/decide", async (req, res) => {
  if (typeof req.body?.accept !== "boolean") {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const user = await professionalFromCookie(req.headers.cookie);
    const booking = await decideChange(req.params.id, user.professionalId!, req.body.accept);
    res.json({ booking });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.post("/:id/cancel", async (req, res) => {
  try {
    const user = await userForSessionToken(readCookie(req.headers.cookie, SESSION_COOKIE));
    if (!user) throw new AuthError(401, "unauthenticated");
    if (user.role !== "client" && user.role !== "professional") throw new AuthError(403, "forbidden");
    const result = await cancelBooking(req.params.id, {
      role: user.role,
      userId: user.id,
      professionalId: user.professionalId,
    });
    res.json(result);
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});
