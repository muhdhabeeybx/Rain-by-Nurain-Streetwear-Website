import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductImage } from "@/components/store/product-image";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { formatNaira } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

const FILTERS = { all: "All", active: "Active", draft: "Drafts", archived: "Archived" } as const;
type Filter = keyof typeof FILTERS;

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="type-display text-display-md">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>
      <Suspense fallback={<div aria-hidden className="mt-8 h-96 animate-pulse bg-mist" />}>
        {searchParams.then(({ status }) => (
          <ProductTable
            filter={typeof status === "string" && status in FILTERS ? (status as Filter) : "all"}
          />
        ))}
      </Suspense>
    </>
  );
}

async function ProductTable({ filter }: { filter: Filter }) {
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("products")
    .select(
      "id, name, color_name, price, status, is_featured, category:categories(name), images:product_images(path, sort_order), variants:product_variants(stock)",
    )
    .order("status")
    .order("sort_order")
    .order("name");
  if (filter !== "all") query = query.eq("status", filter);

  const { data: products, error } = await query;
  if (error) throw new Error(`Could not load products: ${error.message}`);

  return (
    <>
      <nav aria-label="Filter products" className="mt-8">
        <ul className="flex flex-wrap gap-2">
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <li key={key}>
              <Link
                href={
                  (key === "all" ? "/admin/products" : `/admin/products?status=${key}`) as Route
                }
                aria-current={key === filter ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center border px-3 type-label",
                  key === filter
                    ? "border-ink bg-ink text-paper"
                    : "border-line-strong hover:border-ink",
                )}
              >
                {FILTERS[key]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {products.length === 0 ? (
        <div className="mt-8 border-y border-line py-16 text-center">
          <p className="text-muted">No products here yet.</p>
          <Button asChild className="mt-6">
            <Link href="/admin/products/new">Add your first product</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead className="border-b border-ink type-label text-muted">
              <tr>
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 pr-4 font-medium">Price</th>
                <th className="py-3 pr-4 font-medium">Stock</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                const image = product.images.toSorted((a, b) => a.sort_order - b.sort_order)[0];
                return (
                  <tr key={product.id} className="border-b border-line hover:bg-mist/60">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="relative aspect-4/5 w-10 shrink-0 overflow-hidden bg-mist">
                          <ProductImage path={image?.path} alt="" sizes="40px" />
                        </span>
                        <span>
                          <span className="underline-offset-4 hover:underline">{product.name}</span>
                          {product.color_name && (
                            <span className="block text-muted">{product.color_name}</span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-muted">{product.category?.name}</td>
                    <td className="py-2 pr-4 font-mono">{formatNaira(product.price)}</td>
                    <td className={cn("py-2 pr-4 font-mono", stock === 0 && "text-signal")}>
                      {stock === 0 ? "Sold out" : stock}
                    </td>
                    <td className="py-2">
                      <span className="type-label">
                        {product.status}
                        {product.is_featured && " · featured"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
