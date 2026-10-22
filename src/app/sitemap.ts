import type { MetadataRoute } from "next";
import { getCategories, getProductSlugs } from "@/lib/catalog";
import { env } from "@/lib/env";

const PAGES = [
  "",
  "/shop",
  "/about",
  "/contact",
  "/shipping",
  "/returns",
  "/size-guide",
  "/care",
  "/faq",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const [categories, products] = await Promise.all([getCategories(), getProductSlugs()]);

  return [
    ...PAGES.map((path) => ({ url: `${base}${path}` })),
    ...categories
      .filter((category) => category.productCount > 0)
      .map((category) => ({ url: `${base}/shop/${category.slug}` })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
