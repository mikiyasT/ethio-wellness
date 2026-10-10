import { Router } from "express";
import { env } from "../../config/env.js";
import { tokensMatch } from "../../lib/session-cookie.js";
import { prisma } from "../../lib/prisma.js";

export const adminRouter = Router();

function requireAdmin(header: string | undefined) {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return tokensMatch(match[1]!.trim(), env.adminToken);
}

adminRouter.post("/professionals/:id/approve", async (req, res) => {
  if (!requireAdmin(req.headers.authorization)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const professional = await prisma.professional.update({
    where: { id: req.params.id },
    data: { status: "approved" },
    select: { id: true, slug: true, status: true },
  }).catch(() => null);
  if (!professional) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ professional });
});

adminRouter.post("/professionals/:id/reject", async (req, res) => {
  if (!requireAdmin(req.headers.authorization)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const professional = await prisma.professional.update({
    where: { id: req.params.id },
    data: { status: "rejected" },
    select: { id: true, slug: true, status: true },
  }).catch(() => null);
  if (!professional) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ professional });
});
