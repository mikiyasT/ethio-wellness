import { Router } from "express";
import {
  getApprovedProfessional,
  listApprovedProfessionals,
  listOpenAvailability,
  parseLanguageFilter,
  parseSpecialtyFilter,
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
