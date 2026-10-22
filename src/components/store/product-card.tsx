import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { Price } from "./price";
import { ProductImage } from "./product-image";

type ProductCardProps = {
  product: ProductCardData;
  sizes: string;
  eager?: boolean;
};

export function ProductCard({ product, sizes, eager }: ProductCardProps) {
  const [primary, secondary] = product.images;
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <article className="group reveal">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-4/5 overflow-hidden bg-mist">
          <div className="absolute inset-0 transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.04]">
            <ProductImage
              path={primary?.path}
              alt={primary?.alt ?? product.name}
              sizes={sizes}
              eager={eager}
              className={cn(secondary && "transition-opacity duration-500 group-hover:opacity-0")}
            />
            {secondary && (
              <ProductImage
                path={secondary.path}
                alt=""
                sizes={sizes}
                className="opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </div>
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-paper/90 py-3 type-label backdrop-blur transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-y-0"
          >
            View piece <ArrowRight strokeWidth={1.5} className="size-3.5" />
          </span>
          {(product.soldOut || onSale) && (
            <span
              className={cn(
                "absolute top-3 left-3 px-2 py-1 type-label",
                product.soldOut ? "bg-paper text-ink" : "bg-signal text-paper",
              )}
            >
              {product.soldOut ? "Sold out" : "Sale"}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-[0.9375rem] leading-snug">{product.name}</h3>
            {product.colorName && <p className="text-sm text-muted">{product.colorName}</p>}
          </div>
          <Price amount={product.price} compareAt={product.compareAtPrice} className="shrink-0" />
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({
  products,
  eagerCount = 0,
}: {
  products: ProductCardData[];
  /** How many leading cards are above the fold. */
  eagerCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            eager={index < eagerCount}
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        </li>
      ))}
    </ul>
  );
}
