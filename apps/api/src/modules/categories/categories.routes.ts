import { Router } from "express";
import { categories } from "../catalog.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", (_req, res) => {
  res.json({ categories });
});
