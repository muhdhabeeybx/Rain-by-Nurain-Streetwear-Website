/**
 * Environment values that are safe to expose to the browser.
 *
 * Each variable is referenced literally so Next.js can inline it into client
 * bundles. Checked by hand rather than with zod, because this module ships to
 * every page. Server-only secrets live in env.server.ts.
 */

function required(name: string, value: string | undefined) {
  if (!value)
    throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.local.`);
  return value;
}

function url(name: string, value: string | undefined) {
  const raw = required(name, value);
  try {
    return new URL(raw).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Environment variable ${name} must be a full URL, e.g. https://example.com`);
  }
}

/** Database settings are optional: without them the site runs in preview mode (preview.ts). */
function optionalUrl(name: string, value: string | undefined) {
  return value ? url(name, value) : "";
}

export const env = {
  // next.config.ts falls back to the host's URL (Netlify's URL) when this isn't set.
  NEXT_PUBLIC_SITE_URL: url("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
} as const;
