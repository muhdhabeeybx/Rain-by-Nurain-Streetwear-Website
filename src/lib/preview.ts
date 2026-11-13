/**
 * Preview mode: the site runs without a database.
 *
 * Switched on automatically when no database is configured. The storefront
 * shows a small sample catalogue (see preview-catalog.ts) so the design can be
 * reviewed and hosted; checkout, accounts and the admin show an "opens soon"
 * notice instead, and search engines are asked not to index anything.
 *
 * Referenced literally so Next.js inlines it into client bundles too.
 */
export const isPreview =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const PREVIEW_MESSAGE = "Preview · The shop opens soon";

/** Thrown by anything that needs the database, so a missed guard fails loudly. */
export function assertDatabase(what: string) {
  if (isPreview)
    throw new Error(`${what} needs a database, and none is configured (preview mode).`);
}
