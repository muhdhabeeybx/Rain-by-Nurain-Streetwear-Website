import type { Metadata } from "next";
import { CatalogView } from "@/components/store/catalog-view";
import { banners } from "@/config/imagery";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop the Rain by Nurain collection: tees, polos, pants and more, made in Abuja.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return <CatalogView title="Shop all" banner={banners.shop} searchParams={searchParams} />;
}
