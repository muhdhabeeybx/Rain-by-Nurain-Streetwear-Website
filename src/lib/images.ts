import archive from "@/assets/brand/archive.jpg";
import founder from "@/assets/brand/founder.jpg";
import heroCrew from "@/assets/brand/hero-crew.jpg";
import threePs from "@/assets/brand/three-ps.jpg";
import { env } from "@/lib/env";

/** Brand photography standing in for product photos in preview mode. */
const PREVIEW_IMAGES: Record<string, string> = {
  "preview/archive": archive.src,
  "preview/founder": founder.src,
  "preview/hero-crew": heroCrew.src,
  "preview/three-ps": threePs.src,
};

/** URL of a product photo: an object in the "products" storage bucket. */
export function productImageUrl(path: string) {
  if (path in PREVIEW_IMAGES) return PREVIEW_IMAGES[path];
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${encoded}`;
}

/** The same, always absolute: for structured data, social cards and email. */
export function absoluteProductImageUrl(path: string) {
  return new URL(productImageUrl(path), env.NEXT_PUBLIC_SITE_URL).toString();
}
