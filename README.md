# All Eyez On You Beauty Spa — website

Beauty spa website with online booking, a product shop and an admin dashboard. Built for quote SP-2026-006.

**Stack:** Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · PostgreSQL + Drizzle ORM

## What's included

| Quote item | Where |
| --- | --- |
| Website & front-end | `/`, `/services`, `/about`, `/contact` (embedded map) |
| Online booking | `/book`: service → stylist (or "any") → date & time → details. Slots come from each stylist's weekly hours, days off, service duration and per-stylist capacity. Confirmation page + email. Status flow: Pending → Confirmed → Completed / Cancelled |
| Product shop | `/shop` (category filters, stock badges), `/shop/[slug]` (gallery), `/cart`, `/checkout` (delivery or in-store pickup) |
| Admin dashboard | `/admin`: bookings (confirm, reschedule, cancel), orders (paid → ready/shipped → completed, cancel restocks), products (add/edit/remove, stock, pricing), customers, team & hours, services |

## Running locally

```bash
cp .env.example .env.local   # then fill in the values
createdb alleyesonme
npm install
npm run db:migrate
npm run db:seed              # placeholder services, team and products
npm run dev
```

Admin lives at `/admin` and uses the `ADMIN_PASSWORD` from your env file.

## Things to fill in before launch

- **Spa details** (address, phone, WhatsApp, hours, socials, map): `src/lib/site.ts`
- **Brand look** (colours, radius, fonts): tokens at the top of `src/app/globals.css` and fonts in `src/app/layout.tsx`
- **Imagery**: hero, gallery and about images are labelled placeholders (`PlaceholderImage`); product and stylist photos are set in admin
- **Real services, team and products**: edit in `/admin`, or adjust `scripts/seed.ts`
- **Email**: set `RESEND_API_KEY`, `EMAIL_FROM` (verified domain) and `SALON_NOTIFY_EMAIL`. Without a key, emails are logged to the console
- **Online card payments**: checkout currently places the order as *Pending* and the spa sends payment details (EFT). Plug PayFast or Yoco into `src/app/(site)/checkout/actions.ts` once the merchant account exists

## Deploying to Netlify

The repo is ready for Netlify (`netlify.toml`); Netlify's Next.js adapter is applied automatically.

1. **Import the repo** in Netlify: Add new project → Import from Git → this repository. Leave the build settings as detected from `netlify.toml`.
2. **Add a Postgres database.** Either:
   - **Netlify Database** (Data & storage → Database → create): Netlify injects `NETLIFY_DB_URL` into builds and functions automatically, or
   - any hosted Postgres (Neon, Supabase…): set `DATABASE_URL` to its connection string (with `?sslmode=require`).
3. **Set environment variables** (Project configuration → Environment variables):
   | Variable | Value |
   | --- | --- |
   | `ADMIN_PASSWORD` | a strong password for `/admin` |
   | `SESSION_SECRET` | output of `openssl rand -base64 32` |
   | `RESEND_API_KEY` | from resend.com (optional; without it emails are only logged) |
   | `EMAIL_FROM` | e.g. `All Eyez On You Beauty Spa <bookings@yourdomain.co.za>` (domain verified in Resend) |
   | `SALON_NOTIFY_EMAIL` | where new booking/order alerts go |
4. **Deploy.** Every build runs `npm run db:migrate` first, so schema changes go out automatically. The build also reads the catalogue, so the database must exist before the first deploy.
5. **Load starting content (once):** from your machine, point at the production database and seed it, then edit everything in `/admin`:
   ```bash
   DATABASE_URL="<connection string from Data & storage → Database>" npm run db:seed
   ```
   Don't run the seed again after launch: it wipes all bookings and orders.
6. **Domain & SSL:** add the custom domain under Domain management; Netlify issues the SSL certificate automatically.

## Scripts

- `npm run db:generate`: create a migration after changing `src/db/schema.ts`
- `npm run db:migrate`: apply migrations
- `npm run db:seed`: **wipes** all data and loads the placeholder catalogue
- `npm run db:studio`: browse the database
