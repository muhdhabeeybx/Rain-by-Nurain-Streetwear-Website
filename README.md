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
- **Emails go out on their own.** When a payment is confirmed the customer gets a receipt and the
  team gets a new-order alert. Marking an order dispatched (or ready for pickup), delivered,
  cancelled or refunded emails the customer. A payment that doesn't match its order alerts the
  team instead. Preview them all at `/admin/emails`. See [Email](#email).
- **Fast pages.** Catalogue reads are cached with `"use cache"` and the `catalog` tag; admin edits
  and new orders invalidate it, so changes show immediately. Product and category pages are
  prerendered; anything personal streams in behind Suspense.

Money is stored as integer kobo everywhere (₦28,000 = `2800000`).

## Project layout

```
src/
  app/(store)/        Storefront: home, shop, product, checkout, orders, account, help pages
  app/admin/          Admin: overview, orders, products, delivery settings, email previews
  app/api/paystack/   Paystack webhook
  components/         UI primitives (ui/), storefront (store/), admin (admin/), logo (brand/)
  lib/                Data access, checkout rules, Paystack client, email, cart store
  lib/email/          Email templates, design blocks, and who gets what (notify.ts)
  proxy.ts            Refreshes Supabase sessions on account, admin, checkout and order routes
supabase/
  migrations/         Schema, row level security, order and payment functions
  seed.sql            Categories, delivery zones and a pickup location
  templates/          Supabase Auth email (sign-in code), generated from src/lib/email
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
   - Email: keep "Confirm email" on. Under **Emails → Templates**, set both **Confirm signup** (new
     customers) and **Magic Link** (returning customers) to the subject
     `Your Rain by Nurain sign-in code` and paste in the body from
     `supabase/templates/sign-in-code.html`. It is the branded email with the 6-digit code.
   - SMTP: add a custom SMTP provider before launch. Supabase's built-in email is rate-limited and
     only for testing.
5. **Make yourself an admin:** sign in once at `/account/sign-in`, then run in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
6. **Point Paystack at the webhook:** in Paystack → Settings → API Keys & Webhooks, set the webhook
   URL to `https://<your-domain>/api/paystack/webhook`.
7. **Run it:** `npm run dev` and open http://localhost:3000.

## Email

Order emails are sent through [Resend](https://resend.com) from the server, after the response, so
a slow or missing email provider never holds up checkout or the admin. Without `RESEND_API_KEY` and
`EMAIL_FROM` they are skipped and logged.

| Email                | Goes to  | Sent when                                         |
| -------------------- | -------- | ------------------------------------------------- |
| Order confirmed      | Customer | Paystack confirms the payment                     |
| New order            | RBN team | Paystack confirms the payment                     |
| Payment needs review | RBN team | A payment's amount or currency doesn't match      |
| On its way / Ready   | Customer | The order is marked dispatched / ready for pickup |
| Delivered            | Customer | The order is marked delivered / collected         |
| Cancelled, Refunded  | Customer | A **paid** order is cancelled or refunded         |
| Sign-in code         | Customer | Someone signs in (sent by Supabase Auth)          |

- Team alerts go to `ORDER_ALERT_EMAIL` (comma separated), or `site.email` if it isn't set. Replying
  to an alert replies to the customer; replying to a customer email reaches `site.email`.
- A note typed when changing an order's status appears in that email.
- Templates live in `src/lib/email/templates.ts`, built from the blocks in `components.ts`, which
  follow the site's colours and its two typefaces. Logos are PNGs in `public/email/` because most email apps
  don't show SVG.
- The sign-in template is generated from the same design. After changing the design, run
  `UPDATE_EMAIL_TEMPLATES=1 npm test -- templates` and paste `supabase/templates/sign-in-code.html`
  into the Supabase dashboard again.

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

- **Two typefaces.** **Satoshi** (body text, labels and prices) comes from
  [Fontshare](https://www.fontshare.com/fonts/satoshi) under the ITF Free Font License, which allows
  self-hosting but not sharing the files through a public repository. `scripts/fetch-fonts.ts`
  downloads it automatically before `dev` and `build`; the file is git-ignored. **Archivo** (wide
  uppercase headlines) comes from Google Fonts. Satoshi has no ₦ sign, so Archivo supplies it.
- **Home page slideshow:** edit `src/config/home-slides.ts`.
- **Page banners** (shop, categories, help pages): edit `src/config/imagery.ts`.

## Deploying (Netlify)

`main` deploys to Netlify. `netlify.toml` sets the build command, the `.next` publish directory
and Node 24.

**Preview mode.** With no database configured, the site builds and runs as a preview
(`src/lib/preview.ts`): the storefront shows a sample catalogue (`src/lib/preview-catalog.ts`)
photographed in brand imagery, and the announcement bar says the shop opens soon. Checkout works
up to the payment step, then shows a sample confirmation instead of Paystack. The admin shows
sample orders and products (`src/lib/preview-data.ts`, served by `src/lib/admin/preview-client.ts`)
and refuses to save. Accounts show an "opens soon" page, and search engines are told not to index
anything. No
environment variables are needed: the site URL falls back to Netlify's own `URL`.

**Going live** means connecting the database. Then set, under **Site configuration → Environment
variables** (values as in `.env.example`):

- `NEXT_PUBLIC_SITE_URL`: the live URL, e.g. `https://rainbynurain.com`
- the database variables, which switch preview mode off
- `PAYSTACK_SECRET_KEY`
- Optional: `RESEND_API_KEY`, `EMAIL_FROM`, `ORDER_ALERT_EMAIL`

If a build fails, Netlify keeps serving the previous deploy.

## Before launch

- [ ] Real product catalogue and photos added in `/admin/products`
- [ ] Delivery fees and timings confirmed in `/admin/delivery` (the seeded ones are placeholders)
- [ ] Pickup location address entered, or left inactive
- [ ] Custom domain connected; `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL updated
- [ ] Order emails: verify the domain with [Resend](https://resend.com), set `RESEND_API_KEY`,
      `EMAIL_FROM` and `ORDER_ALERT_EMAIL`, then place a test order and check both inboxes
- [ ] Supabase sign-in email templates pasted in (see Getting started, step 4)
- [ ] Supabase custom SMTP configured for sign-in codes
- [ ] Paystack live keys set, webhook URL updated, one real low-value test purchase made and
      refunded
- [ ] Supabase on a paid plan (free projects pause when idle)
- [ ] Privacy policy and terms reviewed by a lawyer
- [ ] Contact email and founder name confirmed in `src/config/site.ts`
