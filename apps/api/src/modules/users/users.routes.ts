import { Router } from "express";
import { unspecifiedContract } from "../../lib/unspecified.js";

export const usersRouter = Router();

usersRouter.get("/me", unspecifiedContract("users.me"));
usersRouter.patch("/me", unspecifiedContract("users.update"));
