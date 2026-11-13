import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { env } from "@/lib/env";
import { assertDatabase } from "@/lib/preview";
import type { Database } from "./database.types";

/**
 * Client acting as the signed-in visitor (or anonymous), so row level security
 * applies. Callers must sit behind a Suspense boundary or run in a Server
 * Action / Route Handler.
 */
export async function createServerSupabase() {
  assertDatabase("Signing in");
  // Session checks compare token expiry with the current time, so they belong
  // to the request, never to a prerendered (or per-session prefetched) shell.
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components can't set cookies. The proxy refreshes sessions
            // before rendering, so it is safe to ignore here.
          }
        },
      },
    },
  );
}
