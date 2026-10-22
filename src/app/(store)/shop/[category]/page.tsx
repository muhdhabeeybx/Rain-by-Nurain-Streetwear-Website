import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogSkeleton, CatalogView } from "@/components/store/catalog-view";
import { categoryBanner } from "@/config/imagery";
import { getCategories, getCategory } from "@/lib/catalog";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const category = await getCategory((await params).category);
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name.toLowerCase()} from Rain by Nurain, made in Abuja.`,
    alternates: { canonical: `/shop/${category.slug}` },
  };
}

export default function CategoryPage({ params, searchParams }: PageProps<"/shop/[category]">) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      {params.then(({ category }) => (
        <CategoryCatalog slug={category} searchParams={searchParams} />
      ))}
    </Suspense>
  );
}

async function CategoryCatalog({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: PageProps<"/shop/[category]">["searchParams"];
}) {
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <CatalogView
      title={category.name}
      description={category.description}
      category={category.slug}
      banner={categoryBanner(category.slug)}
      searchParams={searchParams}
    />
  );
}
