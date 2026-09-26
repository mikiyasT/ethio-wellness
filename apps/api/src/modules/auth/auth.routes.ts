import { Router } from "express";
import { unspecifiedContract } from "../../lib/unspecified.js";

export const authRouter = Router();

authRouter.post("/login", unspecifiedContract("auth.login"));
authRouter.post("/register", unspecifiedContract("auth.register"));
authRouter.post("/forgot-password", unspecifiedContract("auth.forgot-password"));
authRouter.post("/reset-password", unspecifiedContract("auth.reset-password"));
authRouter.post("/logout", unspecifiedContract("auth.logout"));
