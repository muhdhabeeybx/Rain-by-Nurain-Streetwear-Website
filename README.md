# Rain by Nurain

The online store for Rain by Nurain (RBN), a streetwear label from Abuja. Customers browse the
collection, pay with Paystack, and track their orders; the RBN team manages products, stock,
orders and delivery from `/admin`.

**Stack:** Next.js 16 (App Router, Cache Components) · Supabase (Postgres, Auth, Storage) ·
Paystack · Tailwind CSS 4 · TypeScript.

## How it works

- **The database is the source of truth for money and stock.** The browser only ever sends which
  sizes and how many. `create_order` prices the order, adds the delivery fee for the customer's
  state, and reserves the stock in one transaction, so two people can never pay for the last item.
- **An order is paid only when Paystack says so.** Paystack's redirect back to the site and its
  webhook both call `confirm_payment`, which marks the order paid once, and only if the amount and
  currency match the order total exactly. Mismatches are flagged for review in the admin.
- **Unpaid reservations expire.** Stock held for an unpaid order is released after 30 minutes by a
  `pg_cron` job, or immediately if the customer cancels on Paystack.
- **Row level security on every table.** Visitors can read the active catalogue; customers can
  read their own orders; admins (profiles with `role = 'admin'`) can manage everything. Server
  code that needs more (placing orders, confirming payments) uses the secret key and lives only in
  server-only modules.
- **Fast pages.** Catalogue reads are cached with `"use cache"` and the `catalog` tag; admin edits
  and new orders invalidate it, so changes show immediately. Product and category pages are
  prerendered; anything personal streams in behind Suspense.

Money is stored as integer kobo everywhere (₦28,000 = `2800000`).

## Project layout

```
src/
  app/(store)/        Storefront: home, shop, product, checkout, orders, account, help pages
  app/admin/          Admin: overview, orders, products, delivery settings
  app/api/paystack/   Paystack webhook
  components/         UI primitives (ui/), storefront (store/), admin (admin/), logo (brand/)
  lib/                Data access, checkout rules, Paystack client, email, cart store
  proxy.ts            Refreshes Supabase sessions on account, admin, checkout and order routes
supabase/
  migrations/         Schema, row level security, order and payment functions
  seed.sql            Categories, delivery zones and a pickup location
  tests/              Database tests (run against an in-process Postgres)
scripts/              Type generation from the migrations
```

## Getting started

You need Node.js 24, a [Supabase](https://supabase.com) project and a
[Paystack](https://paystack.com) account.

1. **Install:** `npm install`
2. **Configure:** copy `.env.example` to `.env.local` and fill it in from Supabase (Project
   Settings → API Keys) and Paystack (Settings → API Keys & Webhooks). Use Paystack test keys
   until launch.
3. **Create the database:**
   ```sh
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push            # applies supabase/migrations
   ```
   Then run `supabase/seed.sql` once in the Supabase SQL editor.
4. **Configure Supabase Auth** (Authentication in the dashboard):
   - URL configuration: set the Site URL to your site's URL.
   - Email: keep "Confirm email" on. Edit the **Magic Link** template so it sends the 6-digit code,
     e.g. `Your Rain by Nurain sign-in code is {{ .Token }}`.
   - SMTP: add a custom SMTP provider before launch. Supabase's built-in email is rate-limited and
     only for testing.
5. **Make yourself an admin:** sign in once at `/account/sign-in`, then run in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
6. **Point Paystack at the webhook:** in Paystack → Settings → API Keys & Webhooks, set the webhook
   URL to `https://<your-domain>/api/paystack/webhook`.
7. **Run it:** `npm run dev` and open http://localhost:3000.

## Scripts

| Command             | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Start the development server                                        |
| `npm run build`     | Production build (needs the database to be reachable)               |
| `npm test`          | Unit tests and database tests                                       |
| `npm run typecheck` | TypeScript                                                          |
| `npm run lint`      | ESLint                                                              |
| `npm run format`    | Prettier                                                            |
| `npm run db:types`  | Regenerate `src/lib/supabase/database.types.ts` from the migrations |

After changing a migration, run `npm run db:types` and `npm test`.

### Fonts and imagery

- **General Sans** (body text) comes from [Fontshare](https://www.fontshare.com/fonts/general-sans)
  under the ITF Free Font License, which allows self-hosting but not sharing the files through a
  public repository. `scripts/fetch-fonts.ts` downloads it automatically before `dev` and
  `build`; the file is git-ignored.
- **Home page slideshow:** edit `src/config/home-slides.ts`.
- **Page banners** (shop, categories, help pages): edit `src/config/imagery.ts`.

## Before launch

- [ ] Real product catalogue and photos added in `/admin/products`
- [ ] Delivery fees and timings confirmed in `/admin/delivery` (the seeded ones are placeholders)
- [ ] Pickup location address entered, or left inactive
- [ ] Custom domain connected; `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL updated
- [ ] Order emails: verify the domain with [Resend](https://resend.com), set `RESEND_API_KEY` and
      `EMAIL_FROM`
- [ ] Supabase custom SMTP configured for sign-in codes
- [ ] Paystack live keys set, webhook URL updated, one real low-value test purchase made and
      refunded
- [ ] Supabase on a paid plan (free projects pause when idle)
- [ ] Privacy policy and terms reviewed by a lawyer
- [ ] Contact email and founder name confirmed in `src/config/site.ts`
