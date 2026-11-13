import { ArrowLeftRight, ArrowRight, ArrowUpRight, Lock, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import archive from "@/assets/brand/archive.jpg";
import { Monogram } from "@/components/brand/logo";
import { HeroSlider } from "@/components/store/hero-slider";
import { ProductGrid } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import { Button } from "@/components/ui/button";
import { HOME_SLIDES } from "@/config/home-slides";
import { site } from "@/config/site";
import { getCategories, getProducts } from "@/lib/catalog";
import { env } from "@/lib/env";

const MARQUEE = [
  "Rain by Nurain",
  site.tagline,
  "For the hustlers",
  "For the dreamers",
  "Pray, prepare, plan",
];

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <h1 className="sr-only">
        {site.name}: streetwear from {site.city} for the hustlers and dreamers
      </h1>
      <HeroSlider slides={HOME_SLIDES} />
      <Marquee />
      <NewArrivals />
      <ShopByCategory />
      <Story />
      <Promises />
    </>
  );
}

function Marquee() {
  const phrases = (
    <ul className="flex shrink-0 items-center">
      {MARQUEE.map((phrase) => (
        <li
          key={phrase}
          className="flex items-center gap-8 pr-8 type-display text-display-sm whitespace-nowrap"
        >
          {phrase}
          <Monogram title="" className="h-4 w-auto" />
        </li>
      ))}
    </ul>
  );

  return (
    // Decorative: every phrase also appears elsewhere on the page.
    <div aria-hidden className="overflow-hidden bg-ink py-4 text-paper">
      <div className="flex w-max animate-marquee">
        {phrases}
        {phrases}
      </div>
    </div>
  );
}

async function NewArrivals() {
  const products = await getProducts({ sort: "newest", limit: 4 });
  if (products.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="New in"
        title="Latest pieces"
        action={
          <Link
            href="/shop?sort=newest"
            className="group flex items-center gap-2 type-label underline underline-offset-4 hover:no-underline"
          >
            View all
            <ArrowRight
              aria-hidden
              strokeWidth={1.5}
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        }
      />
      <ProductGrid products={products} />
    </section>
  );
}

async function ShopByCategory() {
  const categories = (await getCategories()).filter((category) => category.productCount > 0);
  if (categories.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <SectionHeading eyebrow="Shop" title="By category" />
      <ul className="border-t border-ink">
        {categories.map((category) => (
          <li key={category.slug} className="reveal border-b border-line">
            <Link
              href={`/shop/${category.slug}`}
              className="group flex items-center justify-between gap-6 py-5 md:py-7"
            >
              <span className="type-display text-display-md transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-3">
                {category.name}
              </span>
              <span className="flex items-center gap-4 font-mono text-sm text-muted">
                {category.productCount} {category.productCount === 1 ? "piece" : "pieces"}
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-5 text-ink opacity-0 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Story() {
  return (
    <section className="bg-ink text-paper">
      <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
        <div className="relative aspect-4/5 reveal overflow-hidden lg:col-span-5">
          <Image
            src={archive}
            alt="Nurain, the founder, in a mint sweatshirt and black tie at a museum gallery"
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="reveal lg:col-span-6 lg:col-start-7">
          <p className="type-label text-ink-muted">Our story</p>
          <h2 className="mt-6 type-display text-display-lg">From streets to statements</h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-paper/80">
            RBN was born in motion, between {site.city} grit and global dreams. It is for those who
            understand that home is not just a place; it is carried within. Every stitch is a salute
            to those who left, who grind, who build, and who return.
          </p>
          <Button asChild variant="outlineInverse" className="mt-10">
            <Link href="/about">
              Read our story
              <ArrowRight className="transition-transform duration-300 group-hover/button:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Promises() {
  const promises = [
    {
      icon: Truck,
      title: "Delivered nationwide",
      body: "Doorstep delivery to every state. Your fee and delivery time are shown before you pay.",
    },
    {
      icon: Lock,
      title: "Secure payment",
      body: "Pay by card, bank transfer or USSD through Paystack. We never see your card details.",
    },
    {
      icon: ArrowLeftRight,
      title: `${site.returnWindowHours}-hour exchanges`,
      body: "Wrong size? Exchange unworn pieces within 48 hours of delivery.",
    },
  ];

  return (
    <section className="border-t border-line">
      <ul className="container-page grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {promises.map((promise) => (
          <li key={promise.title} className="reveal py-10 md:px-8 md:first:pl-0 md:last:pr-0">
            <promise.icon aria-hidden strokeWidth={1.5} className="mb-5 size-6" />
            <h2 className="type-label">{promise.title}</h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{promise.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Tells search engines who the brand is and how to search the shop. */
function HomeJsonLd() {
  const url = env.NEXT_PUBLIC_SITE_URL;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: site.name,
        alternateName: site.shortName,
        url,
        logo: `${url}/apple-icon.png`,
        email: site.email,
        slogan: site.tagline,
        sameAs: [site.social.instagram.url, site.social.tiktok.url],
        address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "NG" },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: site.name,
        url,
        publisher: { "@id": `${url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${url}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
