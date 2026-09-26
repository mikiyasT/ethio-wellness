import { Router } from "express";
import { unspecifiedContract } from "../../lib/unspecified.js";

export const professionalsRouter = Router();

professionalsRouter.get("/", unspecifiedContract("professionals.list"));
professionalsRouter.get("/:id", unspecifiedContract("professionals.detail"));
