import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "prisma/config";

// Manually parse .env since Prisma 7 config runs outside Next.js and
// does not auto-load environment variables from .env files.
function loadEnv(envPath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return env;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const envFile = path.join(__dirname, ".env");
const env = loadEnv(envFile);
const databaseUrl = env["DATABASE_URL"] || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    `DATABASE_URL is not set. Please add it to: ${envFile}`
  );
}

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: databaseUrl,
  },
});
