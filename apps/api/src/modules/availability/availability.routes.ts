import { Router } from "express";
import { unspecifiedContract } from "../../lib/unspecified.js";

export const availabilityRouter = Router();

availabilityRouter.get("/", unspecifiedContract("availability.list"));
availabilityRouter.put("/", unspecifiedContract("availability.update"));
