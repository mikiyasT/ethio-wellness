import { Router } from "express";
import { unspecifiedContract } from "../../lib/unspecified.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", unspecifiedContract("categories.list"));
