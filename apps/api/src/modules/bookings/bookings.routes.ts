import { Router } from "express";
import { z } from "zod";
import { readCookie, SESSION_COOKIE } from "../../lib/session-cookie.js";
import { AuthError, professionalFromCookie, userForSessionToken } from "../auth/auth.service.js";
import {
  BookingError,
  cancelBooking,
  createHold,
  findJoinBooking,
  getBooking,
  listForProfessional,
  listMine,
  startCheckout,
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
});

function sendError(res: { status: (code: number) => { json: (body: unknown) => void } }, error: unknown) {
  if (error instanceof BookingError || error instanceof AuthError) {
    res.status(error.status).json({ error: error.code });
    return true;
  }
  return false;
}

bookingsRouter.post("/holds", async (req, res) => {
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
  try {
    const checkout = await startCheckout(req.params.id);
    res.json(checkout);
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

bookingsRouter.get("/join", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const email = typeof req.query.email === "string" ? req.query.email : "";
  if (!code || !email) {
    res.status(400).json({ error: "invalid_body" });
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

bookingsRouter.post("/:id/cancel", async (req, res) => {
  try {
    const user = await userForSessionToken(readCookie(req.headers.cookie, SESSION_COOKIE));
    if (!user) throw new AuthError(401, "unauthenticated");
    if (user.role !== "client" && user.role !== "professional") throw new AuthError(403, "forbidden");
    const booking = await cancelBooking(req.params.id, {
      role: user.role,
      userId: user.id,
      professionalId: user.professionalId,
    });
    res.json({ booking });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});
