import { Router } from "express";
import { z } from "zod";
import { AuthError, professionalFromCookie } from "../auth/auth.service.js";
import {
  getApprovedProfessional,
  getMyProfessional,
  listApprovedProfessionals,
  listOpenAvailability,
  parseLanguageFilter,
  parseSpecialtyFilter,
  updateMyProfessional,
} from "./professionals.service.js";

export const professionalsRouter = Router();

professionalsRouter.get("/", async (req, res) => {
  const languages = parseLanguageFilter(typeof req.query.language === "string" ? req.query.language : undefined);
  const specialties = parseSpecialtyFilter(
    typeof req.query.specialty === "string" ? req.query.specialty : undefined,
  );
  if (!languages || !specialties) {
    res.status(400).json({ error: "invalid_filter" });
    return;
  }
  const professionals = await listApprovedProfessionals({ languages, specialties });
  res.json({ professionals });
});

const profileSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    title: z.string().trim().max(120).optional(),
    city: z.string().trim().max(80).optional(),
    credentials: z.string().max(200).optional(),
    bio: z.string().max(2000).optional(),
    practiceMore: z.string().max(2000).optional(),
    languages: z.array(z.string()).max(8).optional(),
    specialties: z.array(z.string()).max(12).optional(),
    feeCents: z.number().int().min(0).max(100_000).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: "empty" });

function sendAuthError(res: { status: (code: number) => { json: (body: unknown) => void } }, error: unknown) {
  if (error instanceof AuthError) {
    res.status(error.status).json({ error: error.code });
    return true;
  }
  return false;
}

professionalsRouter.get("/me", async (req, res) => {
  try {
    const user = await professionalFromCookie(req.headers.cookie);
    const professional = await getMyProfessional(user.professionalId!);
    if (!professional) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ professional });
  } catch (error) {
    if (!sendAuthError(res, error)) throw error;
  }
});

professionalsRouter.patch("/me", async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const user = await professionalFromCookie(req.headers.cookie);
    const professional = await updateMyProfessional(user.professionalId!, parsed.data);
    if (professional === "invalid_catalog") {
      res.status(400).json({ error: "invalid_catalog" });
      return;
    }
    res.json({ professional });
  } catch (error) {
    if (!sendAuthError(res, error)) throw error;
  }
});

professionalsRouter.get("/:slug/availability", async (req, res) => {
  const professional = await getApprovedProfessional(req.params.slug);
  if (!professional) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const slots = await listOpenAvailability(professional.id);
  res.json({ slots });
});

professionalsRouter.get("/:slug", async (req, res) => {
  const professional = await getApprovedProfessional(req.params.slug);
  if (!professional) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ professional });
});
