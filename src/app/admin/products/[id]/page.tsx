import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { requireAdmin } from "@/lib/admin/auth";
import { nairaInputValue } from "@/lib/money";
import { deleteProduct } from "../actions";
import { getCategoryOptions } from "../categories";
import { ImageManager } from "../image-manager";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Edit product" };

const NOTICES: Record<string, string> = {
  created: "Product created. Add photos below, then set it to Active when it's ready.",
  "has-orders":
    "This product has orders, so it can't be deleted. Set its status to Archived instead.",
  failed: "The product couldn't be deleted. Please try again.",
};

export default function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  return (
    <>
      <Link href="/admin/products" className="type-label text-muted hover:text-ink">
        ← Products
      </Link>
      <Suspense fallback={<div aria-hidden className="mt-8 h-96 animate-pulse bg-mist" />}>
        {Promise.all([params, searchParams]).then(([{ id }, { created, delete: deleteResult }]) => (
          <EditProduct
            id={id}
            notice={
              created
                ? NOTICES.created
                : typeof deleteResult === "string"
                  ? NOTICES[deleteResult]
                  : undefined
            }
          />
        ))}
      </Suspense>
    </>
  );
}

async function EditProduct({ id, notice }: { id: string; notice?: string }) {
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: product, error }, categories] = await Promise.all([
    supabase
      .from("products")
      .select(
        "*, images:product_images(id, path, alt, sort_order, created_at), variants:product_variants(id, size, stock, sku, sort_order)",
      )
      .eq("id", id)
      .maybeSingle(),
    getCategoryOptions(supabase),
  ]);
  if (error) throw new Error(`Could not load product: ${error.message}`);
  if (!product) notFound();

  const images = product.images
    .toSorted((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
    .map(({ id: imageId, path, alt }) => ({ id: imageId, path, alt }));

  return (
    <>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="type-display text-display-md">
          {product.name}
          {product.color_name && <span className="text-muted"> · {product.color_name}</span>}
        </h1>
        {product.status === "active" && (
          <Link href={`/products/${product.slug}`} className="type-label text-muted hover:text-ink">
            View in shop ↗
          </Link>
        )}
      </div>
      {notice && (
        <p role="status" className="mt-6 border border-ink bg-mist p-4 text-sm">
          {notice}
        </p>
      )}

      <div className="mt-10 grid gap-14 2xl:grid-cols-12">
        <div className="max-w-3xl 2xl:col-span-7">
          <ProductForm
            categories={categories}
            values={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              categoryId: product.category_id,
              status: product.status,
              isFeatured: product.is_featured,
              price: nairaInputValue(product.price),
              compareAtPrice: nairaInputValue(product.compare_at_price),
              colorName: product.color_name ?? "",
              colorHex: product.color_hex ?? "",
              styleCode: product.style_code ?? "",
              description: product.description,
              details: product.details.join("\n"),
              sortOrder: product.sort_order,
              variants: product.variants
                .toSorted((a, b) => a.sort_order - b.sort_order)
                .map((variant) => ({
                  id: variant.id,
                  size: variant.size,
                  stock: variant.stock,
                  sku: variant.sku ?? "",
                })),
            }}
          />
        </div>
        <div className="space-y-14 2xl:col-span-5">
          <ImageManager productId={product.id} productName={product.name} images={images} />
          <section className="border-t border-line pt-8">
            <h2 className="type-label">Delete product</h2>
            <p className="mt-2 mb-4 text-sm text-muted">
              Only products that have never been ordered can be deleted. Otherwise, archive them.
            </p>
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmButton
                confirmation={`Delete ${product.name} and its photos permanently? This can't be undone.`}
                size="sm"
                variant="secondary"
                className="border-signal text-signal hover:bg-signal hover:text-paper"
              >
                Delete permanently
              </ConfirmButton>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
