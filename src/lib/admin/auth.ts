import "server-only";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { isPreview } from "@/lib/preview";
import { createServerSupabase } from "@/lib/supabase/server";
import { createPreviewAdminClient } from "./preview-client";

/**
 * Gate for every admin page and action. Returns a client acting as the admin,
 * so row level security still applies to everything it does.
 */
export async function requireAdmin() {
  if (isPreview) {
    // Sample data that can't be changed: see preview-client.ts. Per request, so
    // sample order times follow the clock.
    await connection();
    const supabase = createPreviewAdminClient() as unknown as Awaited<
      ReturnType<typeof createServerSupabase>
    >;
    return { supabase, userId: "preview", email: "preview@example.com" };
  }
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/account/sign-in?next=/admin");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) throw new Error(`Could not check admin access: ${error.message}`);
  // Signed-in customers get a plain 404: the admin area isn't advertised.
  if (!isAdmin) notFound();

  return { supabase, userId: data.claims.sub, email: String(data.claims.email ?? "") };
}

export type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
