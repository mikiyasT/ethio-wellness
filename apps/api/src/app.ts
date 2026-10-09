import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { availabilityRouter } from "./modules/availability/availability.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { bookingsRouter } from "./modules/bookings/bookings.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { professionalsRouter } from "./modules/professionals/professionals.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

function isPrivateLanHost(hostname: string) {
  return (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

/** Local dev: a phone on Wi-Fi opens the site by LAN IP, so that origin must be allowed. */
function isAllowedOrigin(origin: string | undefined) {
  if (!origin) return true;
  if (env.corsOrigins.includes(origin)) return true;
  if (env.cookieSecure) return false;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" && isPrivateLanHost(url.hostname);
  } catch {
    return false;
  }
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        callback(null, isAllowedOrigin(origin));
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.use("/users", usersRouter);
  app.use("/professionals", professionalsRouter);
  app.use("/categories", categoriesRouter);
  app.use("/bookings", bookingsRouter);
  app.use("/availability", availabilityRouter);

  return app;
}
