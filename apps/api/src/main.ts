import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startHoldSweeper } from "./lib/hold-sweeper.js";
import { startReminderSweeper } from "./lib/reminder-sweeper.js";

const app = createApp();
startHoldSweeper();
startReminderSweeper();

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Ayzon API listening on http://0.0.0.0:${env.port}`);
});
