import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/store/product-card";
import { ProductGridSkeleton } from "@/components/store/product-grid-skeleton";
import { getCategories, searchProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = searchParams.then(({ q }) => (typeof q === "string" ? q.trim().slice(0, 100) : ""));

  return (
    <div className="container-page pt-10 pb-24 md:pt-16">
      <h1 className="sr-only">Search</h1>
      <Suspense fallback={<SearchBox />}>
        {query.then((value) => (
          <SearchBox defaultValue={value} />
        ))}
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        {query.then((value) => (value ? <Results query={value} /> : <Suggestions />))}
      </Suspense>
    </div>
  );
}

function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <Form action="/search" role="search" className="border-b border-ink">
      <label htmlFor="q" className="type-label text-muted">
        Search the shop
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Tees, polos, black…"
        autoComplete="off"
        autoFocus
        className="w-full bg-transparent py-4 type-display text-display-md placeholder:text-line-strong focus:outline-none"
      />
    </Form>
  );
}

async function Results({ query }: { query: string }) {
  const products = await searchProducts(query);
  return (
    <section className="mt-10" aria-live="polite">
      <p className="mb-8 type-label text-muted">
        {products.length} {products.length === 1 ? "result" : "results"} for “{query}”
      </p>
      {products.length > 0 ? (
        <ProductGrid products={products} eagerCount={4} />
      ) : (
        <div className="py-16">
          <p className="max-w-md text-muted">
            Nothing matched. Try a simpler word, like “tee” or “black”, or browse everything.
          </p>
          <Link href="/shop" className="mt-6 inline-block type-label underline underline-offset-4">
            Shop all
          </Link>
        </div>
      )}
    </section>
  );
}

async function Suggestions() {
  const categories = (await getCategories()).filter((category) => category.productCount > 0);
  if (categories.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 type-label text-muted">Browse</h2>
      <ul className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/shop/${category.slug}`}
              className="flex h-9 items-center border border-line-strong px-4 type-label hover:border-ink"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
