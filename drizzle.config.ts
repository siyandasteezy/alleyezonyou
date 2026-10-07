import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

// Netlify DB (Neon) exposes NETLIFY_DATABASE_URL; anything else uses DATABASE_URL.
const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL (or NETLIFY_DATABASE_URL) before running migrations.");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
