import { env } from "@/lib/env";

/** Public URL of an object in the "products" storage bucket. */
export function productImageUrl(path: string) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${encoded}`;
}
