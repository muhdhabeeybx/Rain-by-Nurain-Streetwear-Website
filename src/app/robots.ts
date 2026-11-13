import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { isPreview } from "@/lib/preview";

export default function robots(): MetadataRoute.Robots {
  // The preview's sample products shouldn't end up in search results.
  if (isPreview) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/account", "/orders", "/admin", "/search", "/api"],
    },
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
