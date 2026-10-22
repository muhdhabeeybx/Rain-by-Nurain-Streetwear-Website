"use server";

import type { Route } from "next";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { parseNaira } from "@/lib/money";
import { SLUG_PATTERN, slugify } from "@/lib/slug";

export type ProductField =
  | "name"
  | "slug"
  | "categoryId"
  | "price"
  | "compareAtPrice"
  | "colorName"
  | "colorHex"
  | "styleCode"
  | "description"
  | "variants";

export type ProductFormState = {
  status: "idle" | "saved" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ProductField, string>>;
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

const variantSchema = z.object({
  id: z.uuid().optional(),
  size: z.string().trim().min(1, "Every size needs a name").max(20),
  stock: z.int("Stock must be a whole number").min(0, "Stock can't be negative").max(100_000),
  sku: z.string().trim().max(64).optional(),
});

const productSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(2, "Give the product a name").max(120),
    slug: z.string().trim().max(120),
    categoryId: z.uuid("Choose a category"),
    status: z.enum(["draft", "active", "archived"]),
    isFeatured: z.boolean(),
    price: z.string(),
    compareAtPrice: z.string(),
    colorName: optionalText(40),
    colorHex: z
      .string()
      .trim()
      .transform((value) => value || null)
      .refine(
        (value) => value === null || /^#[0-9a-f]{6}$/i.test(value),
        "Use a colour like #121212",
      ),
    styleCode: optionalText(60),
    description: z.string().trim().max(5000),
    details: z.string().max(3000),
    sortOrder: z.coerce.number().int().min(-10_000).max(10_000),
    variants: z.array(variantSchema).max(30),
  })
  .transform((input, context) => {
    const price = parseNaira(input.price);
    if (!price)
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "Enter a price in naira, e.g. 28000",
      });

    const compareAt = input.compareAtPrice.trim() ? parseNaira(input.compareAtPrice) : null;
    if (input.compareAtPrice.trim() && (compareAt === null || (price && compareAt <= price))) {
      context.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "The original price must be higher than the price",
      });
    }

    const slug = input.slug || slugify(input.name, input.colorName);
    if (!SLUG_PATTERN.test(slug)) {
      context.addIssue({
        code: "custom",
        path: ["slug"],
        message: "Use lowercase letters, numbers and dashes",
      });
    }

    const sizes = input.variants.map((variant) => variant.size.toUpperCase());
    if (new Set(sizes).size !== sizes.length) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Each size can only be listed once",
      });
    }
    if (input.status === "active" && input.variants.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Add at least one size before publishing",
      });
    }

    return {
      ...input,
      slug,
      price: price ?? 0,
      compareAtPrice: compareAt,
      styleCode: input.styleCode ? slugify(input.styleCode) : null,
      details: input.details
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };
  });

function readForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "");
  let variants: unknown = [];
  try {
    variants = JSON.parse(text("variants") || "[]");
  } catch {
    // Reported by validation as an invalid variants list.
  }
  return {
    id: text("id") || undefined,
    name: text("name"),
    slug: text("slug"),
    categoryId: text("categoryId"),
    status: text("status"),
    isFeatured: formData.get("isFeatured") === "on",
    price: text("price"),
    compareAtPrice: text("compareAtPrice"),
    colorName: text("colorName"),
    colorHex: text("colorHex"),
    styleCode: text("styleCode"),
    description: text("description"),
    details: text("details"),
    sortOrder: text("sortOrder") || "0",
    variants,
  };
}

function databaseError(error: { code?: string; message: string }): ProductFormState {
  const unique: [string, ProductField, string][] = [
    ["products_slug_key", "slug", "Another product already uses this URL"],
    [
      "product_variants_sku_key",
      "variants",
      "One of these SKUs is already used by another product",
    ],
    ["product_variants_product_id_size_key", "variants", "Each size can only be listed once"],
  ];
  if (error.code === "23505") {
    const match = unique.find(([constraint]) => error.message.includes(constraint));
    if (match) return { status: "error", message: match[2], fieldErrors: { [match[1]]: match[2] } };
  }
  if (error.code === "23001" || error.code === "23503") {
    const message =
      "A size you removed has already been ordered. Keep it and set its stock to 0 instead.";
    return { status: "error", message, fieldErrors: { variants: message } };
  }
  console.error("[admin] save_product failed", error);
  return { status: "error", message: `Couldn't save: ${error.message}` };
}

export async function saveProduct(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ProductField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]) as ProductField;
      fieldErrors[field] ??= issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }
  const input = parsed.data;

  const { data: id, error } = await supabase.rpc("save_product", {
    p_id: input.id, // omitted for a new product
    p_product: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      details: input.details,
      category_id: input.categoryId,
      style_code: input.styleCode,
      color_name: input.colorName,
      color_hex: input.colorHex,
      price: input.price,
      compare_at_price: input.compareAtPrice,
      status: input.status,
      is_featured: input.isFeatured,
      sort_order: input.sortOrder,
    },
    p_variants: input.variants.map(({ id: variantId, size, stock, sku }) =>
      variantId ? { id: variantId, size, stock, sku } : { size, stock, sku },
    ),
  });

  if (error) return databaseError(error);

  updateTag(CATALOG_TAG);
  if (!input.id) redirect(`/admin/products/${id}?created=1` as Route);
  revalidatePath(`/admin/products/${id}`);
  return { status: "saved", message: "Saved." };
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));

  const { data: images } = await supabase
    .from("product_images")
    .select("path")
    .eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    const reason = error.code === "23001" || error.code === "23503" ? "has-orders" : "failed";
    redirect(`/admin/products/${id}?delete=${reason}` as Route);
  }

  if (images?.length) {
    await supabase.storage.from("products").remove(images.map((image) => image.path));
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/products");
}

export async function addProductImage(input: {
  productId: string;
  path: string;
  width: number;
  height: number;
}) {
  const { supabase } = await requireAdmin();
  const { productId, path, width, height } = z
    .object({
      productId: z.uuid(),
      path: z.string().startsWith(`${input.productId}/`).max(200),
      width: z.int().positive(),
      height: z.int().positive(),
    })
    .parse(input);

  const { data: last } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    path,
    width,
    height,
    sort_order: (last?.sort_order ?? -1) + 1,
  });
  if (error) throw new Error(`Couldn't add the image: ${error.message}`);

  updateTag(CATALOG_TAG);
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateImageAlt(imageId: string, alt: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("product_images")
    .update({ alt: alt.trim().slice(0, 200) })
    .eq("id", z.uuid().parse(imageId))
    .select("product_id")
    .single();
  if (error) throw new Error(`Couldn't save the description: ${error.message}`);

  updateTag(CATALOG_TAG);
  revalidatePath(`/admin/products/${data.product_id}`);
}

/** Moves an image one place earlier or later; the first image is the main photo. */
export async function moveImage(imageId: string, direction: "earlier" | "later") {
  const { supabase } = await requireAdmin();
  const { data: image } = await supabase
    .from("product_images")
    .select("product_id")
    .eq("id", z.uuid().parse(imageId))
    .single();
  if (!image) return;

  const { data: images } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", image.product_id)
    .order("sort_order")
    .order("created_at");
  if (!images) return;

  const order = images.map(({ id }) => id);
  const from = order.indexOf(imageId);
  const to = direction === "earlier" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= order.length) return;
  [order[from], order[to]] = [order[to], order[from]];

  await Promise.all(
    order.map((id, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", id),
    ),
  );
  updateTag(CATALOG_TAG);
  revalidatePath(`/admin/products/${image.product_id}`);
}

export async function deleteImage(imageId: string) {
  const { supabase } = await requireAdmin();
  const { data: image, error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", z.uuid().parse(imageId))
    .select("product_id, path")
    .single();
  if (error) throw new Error(`Couldn't remove the image: ${error.message}`);

  await supabase.storage.from("products").remove([image.path]);
  updateTag(CATALOG_TAG);
  revalidatePath(`/admin/products/${image.product_id}`);
}
