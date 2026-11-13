import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import { assertDatabase } from "@/lib/preview";
import type { Database } from "./database.types";

/** Client-side Supabase, sharing the signed-in session cookie. Used for admin uploads. */
export function createBrowserSupabase() {
  assertDatabase("Uploading photos");
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
