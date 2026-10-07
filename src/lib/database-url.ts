// First match wins:
//  - DATABASE_URL: any Postgres (local dev, Neon, Supabase…)
//  - NETLIFY_DB_URL: Netlify Database (Data & storage → Database), injected into builds and functions
//  - NETLIFY_DATABASE_URL: the older Netlify DB / Neon extension
const KEYS = ["DATABASE_URL", "NETLIFY_DB_URL", "NETLIFY_DATABASE_URL"];

type NetlifyGlobal = { Netlify?: { env?: { get(key: string): string | undefined } } };

export function getDatabaseUrl() {
  const netlifyEnv = (globalThis as NetlifyGlobal).Netlify?.env;
  for (const key of KEYS) {
    const value = process.env[key] || netlifyEnv?.get(key);
    if (value) return value;
  }
  return undefined;
}
