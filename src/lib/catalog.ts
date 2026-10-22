import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { compareSizes } from "@/lib/sizes";
import type { Database } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Cache tag for everything a shopper sees in the catalogue. Revalidate it
 * whenever products, prices, images or stock change.
 */
export const CATALOG_TAG = "catalog";

type ProductColumn = keyof Database["public"]["Tables"]["products"]["Row"];

export const SORTS = {
  featured: {
    label: "Featured",
    order: [
      ["is_featured", false],
      ["sort_order", true],
      ["published_at", false],
    ],
  },
  newest: {
    label: "Newest",
    order: [
      ["published_at", false],
      ["created_at", false],
    ],
  },
  "price-asc": { label: "Price, low to high", order: [["price", true]] },
  "price-desc": { label: "Price, high to low", order: [["price", false]] },
} as const satisfies Record<
  string,
  { label: string; order: readonly (readonly [ProductColumn, boolean])[] }
>;

export type SortKey = keyof typeof SORTS;

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && Object.hasOwn(SORTS, value);
}

export type ProductImage = { path: string; alt: string };

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  colorName: string | null;
  price: number;
  compareAtPrice: number | null;
  category: { slug: string; name: string };
  images: ProductImage[];
  soldOut: boolean;
};

export type ProductVariant = { id: string; size: string; stock: number };

export type Colourway = { slug: string; colorName: string | null; colorHex: string | null };

export type ProductDetail = ProductCard & {
  description: string;
  details: string[];
  colorHex: string | null;
  variants: ProductVariant[];
  /** Every colourway of this style, including this one. */
  colourways: Colourway[];
};

export type Category = {
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
};

const CARD_SELECT = `
  id, slug, name, color_name, price, compare_at_price,
  category:categories!inner(slug, name),
  images:product_images(path, alt, sort_order),
  variants:product_variants(stock)
`;

const DETAIL_SELECT = `
  id, slug, name, description, details, style_code, color_name, color_hex,
  price, compare_at_price,
  category:categories!inner(slug, name),
  images:product_images(path, alt, sort_order),
  variants:product_variants(id, size, stock, sort_order)
`;

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

type CardRow = {
  id: string;
  slug: string;
  name: string;
  color_name: string | null;
  price: number;
  compare_at_price: number | null;
  category: { slug: string; name: string };
  images: { path: string; alt: string; sort_order: number }[];
  variants: { stock: number }[];
};

function toCard(row: CardRow): ProductCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    colorName: row.color_name,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    category: row.category,
    images: row.images
      .toSorted(bySortOrder)
      .map(({ path, alt }) => ({ path, alt: alt || row.name })),
    soldOut: row.variants.every((variant) => variant.stock <= 0),
  };
}

function fail(what: string, error: { message: string }): never {
  throw new Error(`Could not load ${what}: ${error.message}`);
}

export async function getProducts({
  category,
  sort = "featured",
  limit,
}: { category?: string; sort?: SortKey; limit?: number } = {}): Promise<ProductCard[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  let query = createPublicClient().from("products").select(CARD_SELECT).eq("status", "active");
  if (category) query = query.eq("category.slug", category);
  for (const [column, ascending] of SORTS[sort].order) {
    query = query.order(column, { ascending, nullsFirst: false });
  }
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) fail("products", error);
  return data.map(toCard);
}

export async function searchProducts(text: string): Promise<ProductCard[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_SELECT)
    .eq("status", "active")
    .textSearch("search", text, { type: "websearch", config: "english" })
    .limit(48);

  if (error) fail("search results", error);
  return data.map(toCard);
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const supabase = createPublicClient();
  const { data: row, error } = await supabase
    .from("products")
    .select(DETAIL_SELECT)
    .eq("status", "active")
    .eq("slug", slug)
    .maybeSingle();

  if (error) fail(`product "${slug}"`, error);
  if (!row) return null;

  let colourways: Colourway[] = [
    { slug: row.slug, colorName: row.color_name, colorHex: row.color_hex },
  ];
  if (row.style_code) {
    const { data: siblings, error: siblingsError } = await supabase
      .from("products")
      .select("slug, color_name, color_hex")
      .eq("status", "active")
      .eq("style_code", row.style_code)
      .order("sort_order");
    if (siblingsError) fail(`colourways of "${slug}"`, siblingsError);
    colourways = siblings.map((sibling) => ({
      slug: sibling.slug,
      colorName: sibling.color_name,
      colorHex: sibling.color_hex,
    }));
  }

  const variants = row.variants
    .toSorted((a, b) => bySortOrder(a, b) || compareSizes(a.size, b.size))
    .map(({ id, size, stock }) => ({ id, size, stock }));

  return {
    ...toCard({ ...row, variants }),
    description: row.description,
    details: row.details,
    colorHex: row.color_hex,
    variants,
    colourways,
  };
}

export async function getRelatedProducts(
  product: Pick<ProductCard, "id" | "category">,
  limit = 4,
): Promise<ProductCard[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const { data, error } = await createPublicClient()
    .from("products")
    .select(CARD_SELECT)
    .eq("status", "active")
    .eq("category.slug", product.category.slug)
    .neq("id", product.id)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) fail("related products", error);
  return data.map(toCard);
}

/** Categories in display order, with how many products each has on sale. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CATALOG_TAG);

  const { data, error } = await createPublicClient()
    .from("categories")
    .select("slug, name, description, products(count)")
    .order("sort_order");

  if (error) fail("categories", error);
  return data.map(({ products, ...category }) => ({
    ...category,
    productCount: products[0]?.count ?? 0,
  }));
}

export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

/** Slugs of every product on sale, for the sitemap. */
export async function getProductSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const { data, error } = await createPublicClient()
    .from("products")
    .select("slug, updated_at")
    .eq("status", "active");

  if (error) fail("product slugs", error);
  return data.map(({ slug, updated_at }) => ({ slug, updatedAt: updated_at }));
}
