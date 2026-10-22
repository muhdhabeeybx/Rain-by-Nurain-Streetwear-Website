import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "./database.types";

/**
 * Privileged client that bypasses row level security. Only for server code
 * that has already decided the caller is allowed: placing orders, confirming
 * payments, and opening a guest's order with its access token.
 */
export function createServiceClient() {
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
