import { ArrowLeftRight, Lock, Ruler, Shirt, Truck, WashingMachine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { AddToBag } from "@/components/store/add-to-bag";
import { CareGuide } from "@/components/store/care-guide";
import { Price } from "@/components/store/price";
import { ProductGrid } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { SectionHeading } from "@/components/store/section-heading";
import { SizeChartTable, SizeGuideContent } from "@/components/store/size-guide";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { site } from "@/config/site";
import { FIT_SUMMARY, sizeChartFor } from "@/content/size-guide";
import { getProduct, getRelatedProducts, type ProductDetail } from "@/lib/catalog";
import { deliveryEstimate, deliveryRange } from "@/lib/checkout/fees";
import { type DeliveryOptions, getDeliveryOptions } from "@/lib/delivery";
import { formatNaira } from "@/lib/money";
import { env } from "@/lib/env";
import { productImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  // Crawlers wait for metadata before the page streams, so this gives them a real 404.
  if (!product) notFound();

  const title = product.colorName ? `${product.name}, ${product.colorName}` : product.name;
  const description =
    product.description.slice(0, 155) || `${title} by ${site.name}. Made in ${site.city}.`;
  const image = product.images[0];

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      images: image ? [{ url: productImageUrl(image.path), alt: image.alt }] : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense
      fallback={
        <ViewTransition exit="slide-down" default="none">
          <ProductSkeleton />
        </ViewTransition>
      }
    >
      <ViewTransition enter="slide-up" default="none">
        {params.then(({ slug }) => (
          <ProductContent slug={slug} />
        ))}
      </ViewTransition>
    </Suspense>
  );
}

async function ProductContent({ slug }: { slug: string }) {
  const [product, delivery] = await Promise.all([getProduct(slug), getDeliveryOptions()]);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} />
      <div className="lg:container-page lg:pt-6">
        <Breadcrumbs product={product} />
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>
          <div className="container-page pt-6 pb-16 lg:col-span-5 lg:px-0 lg:pt-0">
            <div className="lg:sticky lg:top-24">
              <ProductSummary product={product} delivery={delivery} />
            </div>
          </div>
        </div>
      </div>
      <Suspense>
        <RelatedProducts product={product} />
      </Suspense>
    </>
  );
}

function Breadcrumbs({ product }: { product: ProductDetail }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="container-page py-4 type-label text-muted lg:px-0 lg:pt-0"
    >
      <ol className="flex flex-wrap gap-2">
        <li>
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link href={`/shop/${product.category.slug}`} className="hover:text-ink">
            {product.category.name}
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-ink">
          {product.name}
        </li>
      </ol>
    </nav>
  );
}

function ProductSummary({
  product,
  delivery,
}: {
  product: ProductDetail;
  delivery: DeliveryOptions;
}) {
  const chart = sizeChartFor(product.category.slug);
  const sizes = product.variants.map((variant) => variant.size);
  const range = deliveryRange(delivery.zones);
  const [pickup] = delivery.pickupLocations;

  return (
    <>
      <h1 className="type-display text-display-md">{product.name}</h1>
      <Price amount={product.price} compareAt={product.compareAtPrice} className="mt-3 text-base" />

      {product.colourways.length > 1 ? (
        <div className="mt-8">
          <p className="mb-3 type-label">Colour: {product.colorName}</p>
          <ul className="flex flex-wrap gap-2">
            {product.colourways.map((colourway) => {
              const isCurrent = colourway.slug === product.slug;
              return (
                <li key={colourway.slug}>
                  <Link
                    href={`/products/${colourway.slug}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2 border px-3 text-sm",
                      isCurrent ? "border-ink" : "border-line-strong hover:border-ink",
                    )}
                  >
                    {colourway.colorHex && (
                      <span
                        aria-hidden
                        className="size-4 border border-ink/20"
                        style={{ backgroundColor: colourway.colorHex }}
                      />
                    )}
                    {colourway.colorName ?? "Default"}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        product.colorName && <p className="mt-6 text-sm text-muted">Colour: {product.colorName}</p>
      )}

      <div className="mt-8">
        <AddToBag
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            colorName: product.colorName,
            price: product.price,
            imagePath: product.images[0]?.path ?? null,
          }}
          variants={product.variants}
          sizeGuide={
            <>
              <SizeGuideContent categorySlug={product.category.slug} sizes={sizes} />
              <Link
                href="/size-guide"
                className="mt-8 inline-block type-label underline underline-offset-4"
              >
                Full size guide
              </Link>
            </>
          }
        />
      </div>

      <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-muted">
        {[
          { icon: Truck, text: "Delivery across Nigeria" },
          { icon: ArrowLeftRight, text: `${site.returnWindowHours}-hour exchanges` },
          { icon: Lock, text: "Secure checkout" },
        ].map((perk) => (
          <li
            key={perk.text}
            className="flex flex-col items-center gap-2 border border-line px-2 py-3"
          >
            <perk.icon aria-hidden strokeWidth={1.5} className="size-5 text-ink" />
            {perk.text}
          </li>
        ))}
      </ul>

      {product.description && (
        <p className="mt-10 leading-relaxed whitespace-pre-line text-ink/85">
          {product.description}
        </p>
      )}

      <Accordion type="multiple" defaultValue={["details"]} className="mt-10">
        {product.details.length > 0 && (
          <AccordionItem value="details" title="Details" icon={<Shirt />}>
            <ul className="list-disc space-y-1 pl-5">
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </AccordionItem>
        )}
        <AccordionItem value="fit" title="Size & fit" icon={<Ruler />}>
          <p>{FIT_SUMMARY}</p>
          {chart && <SizeChartTable chart={chart} highlight={sizes} className="mt-4" />}
          <Link href="/size-guide" className="mt-4 inline-block underline underline-offset-4">
            How to measure
          </Link>
        </AccordionItem>
        <AccordionItem value="delivery" title="Delivery & returns" icon={<Truck />}>
          {range ? (
            <p>
              Delivered across Nigeria from{" "}
              <span className="font-mono">{formatNaira(range.fromFee)}</span>, in{" "}
              {deliveryEstimate(range)} depending on your state
              {range.freeOver !== null && (
                <>
                  , and free on orders over{" "}
                  <span className="font-mono">{formatNaira(range.freeOver)}</span> in some areas
                </>
              )}
              . You&apos;ll see your exact fee at checkout.{" "}
              <Link href="/shipping" className="underline underline-offset-4">
                Fees by state
              </Link>
            </p>
          ) : (
            <p>
              Your delivery fee and estimated delivery time are shown at checkout before you pay.
            </p>
          )}
          {pickup && (
            <p className="mt-3">
              Or collect it free from {pickup.name}, {pickup.city}.
            </p>
          )}
          <p className="mt-3">
            Unworn pieces with tags attached can be exchanged within {site.returnWindowHours} hours
            of delivery.{" "}
            <Link href="/returns" className="underline underline-offset-4">
              Returns &amp; exchanges
            </Link>
          </p>
        </AccordionItem>
        <AccordionItem value="care" title="Care" icon={<WashingMachine />}>
          <CareGuide compact />
        </AccordionItem>
      </Accordion>
    </>
  );
}

async function RelatedProducts({ product }: { product: ProductDetail }) {
  const related = await getRelatedProducts(product);
  if (related.length === 0) return null;

  return (
    <section className="container-page border-t border-line py-16 md:py-24">
      <SectionHeading title="You may also like" />
      <ProductGrid products={related} />
    </section>
  );
}

function ProductJsonLd({ product }: { product: ProductDetail }) {
  const url = `${env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.colorName ? `${product.name} (${product.colorName})` : product.name,
    description: product.description || undefined,
    image: product.images.map((image) => productImageUrl(image.path)),
    url,
    color: product.colorName ?? undefined,
    category: product.category.name,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url,
      price: (product.price / 100).toFixed(2),
      priceCurrency: "NGN",
      availability: product.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so product text can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function ProductSkeleton() {
  return (
    <div
      aria-hidden
      className="lg:container-page lg:grid lg:grid-cols-12 lg:gap-10 lg:pt-16 xl:gap-16"
    >
      <div className="aspect-4/5 animate-pulse bg-mist lg:col-span-7" />
      <div className="container-page space-y-4 pt-6 lg:col-span-5 lg:px-0 lg:pt-0">
        <div className="h-10 w-3/4 animate-pulse bg-mist" />
        <div className="h-5 w-1/4 animate-pulse bg-mist" />
        <div className="mt-10 grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse bg-mist" />
          ))}
        </div>
        <div className="h-14 animate-pulse bg-mist" />
      </div>
    </div>
  );
}
