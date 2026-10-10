import { Router } from "express";
import { z } from "zod";
import { AuthError, professionalFromCookie } from "../auth/auth.service.js";
import { AvailabilityError, listMyAvailability, replaceMyOpenHours } from "./availability.service.js";

export const availabilityRouter = Router();

const putSchema = z.object({
  hours: z
    .array(
      z.object({
        date: z.string(),
        time: z.string(),
      }),
    )
    .max(24 * 120),
});

function sendError(res: { status: (code: number) => { json: (body: unknown) => void } }, error: unknown) {
  if (error instanceof AuthError || error instanceof AvailabilityError) {
    res.status(error.status).json(
      error instanceof AvailabilityError && error.minDate
        ? { error: error.code, minDate: error.minDate }
        : { error: error.code },
    );
    return true;
  }
  return false;
}

availabilityRouter.get("/me", async (req, res) => {
  try {
    const user = await professionalFromCookie(req.headers.cookie);
    const slots = await listMyAvailability(user.professionalId!);
    res.json({ slots });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});

availabilityRouter.put("/me", async (req, res) => {
  const parsed = putSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const user = await professionalFromCookie(req.headers.cookie);
    const slots = await replaceMyOpenHours(user.professionalId!, parsed.data.hours);
    res.json({ slots });
  } catch (error) {
    if (!sendError(res, error)) throw error;
  }
});
