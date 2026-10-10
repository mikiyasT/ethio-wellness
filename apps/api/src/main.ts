import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startHoldSweeper } from "./lib/hold-sweeper.js";

const app = createApp();
startHoldSweeper();

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Ayzon API listening on http://0.0.0.0:${env.port}`);
});
