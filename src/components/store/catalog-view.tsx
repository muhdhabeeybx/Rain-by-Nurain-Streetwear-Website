import type { Route } from "next";
import Link from "next/link";
import { Suspense, ViewTransition } from "react";
import type { Banner } from "@/config/imagery";
import { getCategories, getProducts, isSortKey, SORTS, type SortKey } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { PageHero } from "./page-hero";
import { ProductGrid } from "./product-card";
import { ProductGridSkeleton } from "./product-grid-skeleton";

type CatalogViewProps = {
  title: string;
  description?: string | null;
  /** Limit to one category; omit for the whole shop. */
  category?: string;
  banner: Banner;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Product listing shared by /shop and /shop/[category]. */
export function CatalogView({
  title,
  description,
  category,
  banner,
  searchParams,
}: CatalogViewProps) {
  const basePath = (category ? `/shop/${category}` : "/shop") as Route;

  return (
    <>
      <PageHero banner={banner} eyebrow="Shop" title={title} intro={description} size="sm" />
      <div className="container-page pb-24">
        <CategoryTabs active={category} />
        <Suspense
          fallback={
            <ViewTransition exit="slide-down" default="none">
              <ResultsSkeleton />
            </ViewTransition>
          }
        >
          <ViewTransition enter="slide-up" default="none">
            <Results category={category} basePath={basePath} searchParams={searchParams} />
          </ViewTransition>
        </Suspense>
      </div>
    </>
  );
}

async function CategoryTabs({ active }: { active?: string }) {
  const categories = (await getCategories()).filter((category) => category.productCount > 0);
  const tabs: { label: string; href: Route; isActive: boolean }[] = [
    { label: "All", href: "/shop", isActive: !active },
    ...categories.map((category) => ({
      label: category.name,
      href: `/shop/${category.slug}` as Route,
      isActive: category.slug === active,
    })),
  ];

  return (
    <nav aria-label="Categories" className="-mx-4 mt-8 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex gap-2">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.isActive ? "page" : undefined}
              className={cn(
                "flex h-9 items-center border px-4 type-label whitespace-nowrap transition-colors",
                tab.isActive
                  ? "border-ink bg-ink text-paper"
                  : "border-line-strong hover:border-ink",
              )}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

async function Results({
  category,
  basePath,
  searchParams,
}: {
  category?: string;
  basePath: Route;
  searchParams: CatalogViewProps["searchParams"];
}) {
  const { sort } = await searchParams;
  const sortKey: SortKey = isSortKey(sort) ? sort : "featured";
  const products = await getProducts({ category, sort: sortKey });

  return (
    <>
      <div className="mt-6 mb-8 flex flex-col gap-4 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
        <p className="type-label text-muted">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
        <nav aria-label="Sort" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex gap-5 type-label whitespace-nowrap">
            {(Object.keys(SORTS) as SortKey[]).map((key) => (
              <li key={key}>
                <Link
                  href={(key === "featured" ? basePath : `${basePath}?sort=${key}`) as Route}
                  scroll={false}
                  aria-current={key === sortKey ? "true" : undefined}
                  className={cn(
                    "underline-offset-4 hover:text-ink",
                    key === sortKey ? "text-ink underline" : "text-muted",
                  )}
                >
                  {SORTS[key].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {products.length > 0 ? (
        <ProductGrid products={products} eagerCount={4} />
      ) : (
        <div className="py-24 text-center">
          <p className="type-display text-display-sm">Nothing here yet</p>
          <p className="mt-3 text-muted">New pieces are on the way. Check back soon.</p>
        </div>
      )}
    </>
  );
}

/** Placeholder for a whole listing page while its category loads. */
export function CatalogSkeleton() {
  return (
    <div aria-hidden>
      <div className="min-h-[15rem] animate-pulse bg-mist md:h-[38svh] md:min-h-[18rem]" />
      <div className="container-page pb-24">
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-9 w-20 animate-pulse bg-mist" />
          ))}
        </div>
        <ResultsSkeleton />
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <>
      <div className="mt-6 mb-8 h-9 border-b border-line" />
      <ProductGridSkeleton count={8} />
    </>
  );
}
