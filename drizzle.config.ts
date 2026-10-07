import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { getDatabaseUrl } from "./src/lib/database-url";

loadEnvConfig(process.cwd());

const url = getDatabaseUrl();
if (!url) {
  throw new Error(
    "No database configured. Create one under Data & storage → Database in Netlify, or set DATABASE_URL.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
