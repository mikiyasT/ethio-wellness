import { Router } from "express";
import { unspecifiedContract } from "../../lib/unspecified.js";

export const bookingsRouter = Router();

bookingsRouter.get("/", unspecifiedContract("bookings.list"));
bookingsRouter.post("/", unspecifiedContract("bookings.create"));
bookingsRouter.get("/:id", unspecifiedContract("bookings.detail"));
