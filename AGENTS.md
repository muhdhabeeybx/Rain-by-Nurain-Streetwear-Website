<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

- Read `README.md` first: it explains how money, stock and payments flow.
- Money is integer kobo everywhere. Format with `formatNaira`; parse admin input with `parseNaira`.
- Never compute prices, totals or stock in application code. The database functions in
  `supabase/migrations` (`create_order`, `confirm_payment`, `save_product`, …) are the authority.
- Every table has row level security. Use `createPublicClient` for cached catalogue reads,
  `createServerSupabase` for anything acting as the visitor, and `createServiceClient` only in
  server code that has already authorised the caller.
- Catalogue reads are `"use cache"` functions tagged `catalog`; delivery options are tagged
  `delivery`. Invalidate the tag in any action that changes that data.
- Every admin page and server action calls `requireAdmin()` itself; layouts render in parallel
  with pages, so a layout check alone does not protect anything.
- After editing a migration: `npm run db:types`, then `npm test`.
- Before finishing: `npm run typecheck`, `npm run lint`, `npm test`.
