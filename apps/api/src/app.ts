import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { availabilityRouter } from "./modules/availability/availability.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { bookingsRouter } from "./modules/bookings/bookings.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { professionalsRouter } from "./modules/professionals/professionals.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/professionals", professionalsRouter);
  app.use("/categories", categoriesRouter);
  app.use("/bookings", bookingsRouter);
  app.use("/availability", availabilityRouter);

  return app;
}
