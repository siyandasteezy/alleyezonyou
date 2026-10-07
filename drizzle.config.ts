import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./src/lib/database-url";

loadEnvConfig(process.cwd());

const url = getDatabaseUrl();
if (!url) {
  // Names only (never values), to show what the build environment provides.
  const seen = Object.keys(process.env).filter((k) => /DATABASE|_DB_|^NETLIFY_DB/.test(k));
  throw new Error(
    "No database configured. Create one under Data & storage → Database in Netlify, or set DATABASE_URL. " +
      `Database-related variables present: ${seen.join(", ") || "none"}`,
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
