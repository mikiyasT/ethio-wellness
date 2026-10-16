import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const direct = process.env.DIRECT_URL?.trim();
if (!direct) {
  console.error("DIRECT_URL is required for prisma migrate deploy");
  process.exit(1);
}

const require = createRequire(import.meta.url);
let prismaCli;
try {
  prismaCli = require.resolve("prisma/build/index.js");
} catch {
  console.error("The prisma CLI is not installed. Migrations did not run.");
  process.exit(1);
}

const apiRoot = fileURLToPath(new URL("..", import.meta.url));
console.log("prisma migrate deploy using DIRECT_URL");
const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
  cwd: apiRoot,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: direct },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
