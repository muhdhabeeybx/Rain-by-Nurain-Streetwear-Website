import "server-only";
import type { AdminClient } from "@/lib/admin/auth";

export async function getCategoryOptions(supabase: AdminClient) {
  const { data, error } = await supabase.from("categories").select("id, name").order("sort_order");
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return data;
}
