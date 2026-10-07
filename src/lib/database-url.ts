// Netlify DB (Neon) exposes NETLIFY_DATABASE_URL; anything else uses DATABASE_URL.
export const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
