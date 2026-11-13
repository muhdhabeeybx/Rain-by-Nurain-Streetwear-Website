/**
 * The sample catalogue shown in preview mode (see preview.ts). Placeholder
 * pieces photographed in real RBN imagery; replaced by the real catalogue as
 * soon as a database is connected. Nothing here can be bought.
 */
import type { DeliveryOptions } from "@/lib/delivery";
import { compareSizes } from "@/lib/sizes";
import type {
  Category,
  Colourway,
  ProductCard,
  ProductDetail,
  ProductVariant,
  SortKey,
} from "./catalog";

/** Deterministic UUIDs: the cart and checkout validate ids as UUIDs. */
export const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

export const CATEGORIES = [
  { slug: "tees", name: "T-Shirts" },
  { slug: "polos", name: "Polos" },
  { slug: "hoodies", name: "Hoodies & Sweats" },
  { slug: "pants", name: "Pants" },
  { slug: "outerwear", name: "Outerwear" },
  { slug: "accessories", name: "Accessories" },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export type Sample = {
  slug: string;
  name: string;
  styleCode?: string;
  colorName: string;
  colorHex: string;
  category: CategorySlug;
  price: number;
  compareAtPrice?: number;
  image: string;
  alt: string;
  description: string;
  details: string[];
  stock: Record<string, number>;
  featured?: boolean;
};

const NAIRA = 100;

export const SAMPLES: Sample[] = [
  {
    slug: "three-ps-jersey-black",
    name: "Three P's Jersey",
    colorName: "Black",
    colorHex: "#121212",
    category: "tees",
    price: 25_000 * NAIRA,
    image: "preview/three-ps",
    alt: "The back of a black Three P's jersey reading Pray, Prepare, Plan",
    description:
      "Pray, prepare, plan. A heavyweight jersey with the three P's printed across the back, cut boxy with dropped shoulders.",
    details: [
      "Heavyweight cotton jersey",
      "Boxy fit, dropped shoulders",
      "Screen-printed back graphic",
    ],
    stock: { S: 4, M: 8, L: 6, XL: 3, XXL: 1 },
    featured: true,
  },
  {
    slug: "archive-sweatshirt-mint",
    name: "Archive Sweatshirt",
    colorName: "Mint",
    colorHex: "#b9d8c2",
    category: "hoodies",
    price: 32_000 * NAIRA,
    image: "preview/archive",
    alt: "A mint Rain by Nurain sweatshirt worn with a shirt and tie",
    description:
      "Soft brushed fleece in mint, made to dress up or down. Wear it over a collar like the founder does.",
    details: ["Brushed-back cotton fleece", "Ribbed cuffs and hem", "Embroidered chest logo"],
    stock: { S: 2, M: 5, L: 5, XL: 2 },
    featured: true,
  },
  {
    slug: "crew-graphic-tee-black",
    name: "Crew Graphic Tee",
    styleCode: "crew-tee",
    colorName: "Black",
    colorHex: "#121212",
    category: "tees",
    price: 15_000 * NAIRA,
    image: "preview/hero-crew",
    alt: "The Rain by Nurain crew in graphic tees and wide-leg pants",
    description: "The everyday graphic tee, for the hustlers and the dreamers.",
    details: ["Midweight cotton", "Regular fit", "Front graphic"],
    stock: { S: 10, M: 12, L: 9, XL: 6, XXL: 2 },
  },
  {
    slug: "crew-graphic-tee-bone",
    name: "Crew Graphic Tee",
    styleCode: "crew-tee",
    colorName: "Bone",
    colorHex: "#e8e0cf",
    category: "tees",
    price: 15_000 * NAIRA,
    image: "preview/hero-crew",
    alt: "The Rain by Nurain crew in graphic tees and wide-leg pants",
    description: "The everyday graphic tee, for the hustlers and the dreamers.",
    details: ["Midweight cotton", "Regular fit", "Front graphic"],
    stock: { S: 3, M: 0, L: 4, XL: 2 },
  },
  {
    slug: "rain-polo-grey",
    name: "RAIN Polo",
    colorName: "Grey",
    colorHex: "#8f8f8c",
    category: "polos",
    price: 22_000 * NAIRA,
    image: "preview/three-ps",
    alt: "A grey RAIN polo beside a black Three P's jersey",
    description: "A clean piqué polo with the RAIN wordmark. Smart enough for anywhere.",
    details: ["Cotton piqué", "Two-button placket", "Wordmark embroidery"],
    stock: { S: 3, M: 6, L: 6, XL: 2 },
  },
  {
    slug: "wide-leg-pants-black",
    name: "Wide-Leg Pants",
    colorName: "Black",
    colorHex: "#121212",
    category: "pants",
    price: 35_000 * NAIRA,
    compareAtPrice: 42_000 * NAIRA,
    image: "preview/hero-crew",
    alt: "The Rain by Nurain crew in graphic tees and wide-leg pants",
    description: "Relaxed through the leg with a clean drape. Pairs with everything in the drop.",
    details: ["Cotton twill", "Wide, relaxed leg", "Elasticated back waist"],
    stock: { S: 2, M: 4, L: 3, XL: 1 },
  },
  {
    slug: "studio-suit-jacket-tan",
    name: "Studio Suit Jacket",
    colorName: "Tan",
    colorHex: "#c2a27c",
    category: "outerwear",
    price: 85_000 * NAIRA,
    image: "preview/founder",
    alt: "Nurain, the founder, in a tan suit and white sneakers",
    description: "Tailoring on RBN terms: a relaxed tan jacket made to be worn with sneakers.",
    details: ["Lightweight suiting", "Relaxed, unstructured fit", "Two front pockets"],
    stock: { M: 0, L: 0, XL: 0 },
  },
];

export const PUBLISHED = "2026-11-01T09:00:00.000Z";

function categoryOf(sample: Sample) {
  const category = CATEGORIES.find((candidate) => candidate.slug === sample.category)!;
  return { slug: category.slug, name: category.name };
}

export function variantsOf(sample: Sample, index: number): ProductVariant[] {
  return Object.entries(sample.stock)
    .map(([size, stock], sizeIndex) => ({ id: uuid(1000 + index * 20 + sizeIndex), size, stock }))
    .toSorted((a, b) => compareSizes(a.size, b.size));
}

function toCard(sample: Sample, index: number): ProductCard {
  return {
    id: uuid(index + 1),
    slug: sample.slug,
    name: sample.name,
    colorName: sample.colorName,
    price: sample.price,
    compareAtPrice: sample.compareAtPrice ?? null,
    category: categoryOf(sample),
    images: [{ path: sample.image, alt: sample.alt }],
    soldOut: Object.values(sample.stock).every((stock) => stock <= 0),
  };
}

const CARDS = SAMPLES.map(toCard);

export function previewProducts({
  category,
  sort = "featured",
  limit,
}: { category?: string; sort?: SortKey; limit?: number } = {}): ProductCard[] {
  const indexed = SAMPLES.map((sample, index) => ({ sample, card: CARDS[index], index }));
  const filtered = indexed.filter(({ sample }) => !category || sample.category === category);
  const sorted = filtered.toSorted((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.card.price - b.card.price;
      case "price-desc":
        return b.card.price - a.card.price;
      case "newest":
        return b.index - a.index;
      default:
        return (
          Number(Boolean(b.sample.featured)) - Number(Boolean(a.sample.featured)) ||
          a.index - b.index
        );
    }
  });
  return sorted.slice(0, limit).map(({ card }) => card);
}

export function previewSearch(text: string): ProductCard[] {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return SAMPLES.flatMap((sample, index) => {
    const haystack = [sample.name, sample.colorName, sample.description, categoryOf(sample).name]
      .join(" ")
      .toLowerCase();
    return words.every((word) => haystack.includes(word)) ? [CARDS[index]] : [];
  });
}

export function previewProduct(slug: string): ProductDetail | null {
  const index = SAMPLES.findIndex((sample) => sample.slug === slug);
  if (index === -1) return null;
  const sample = SAMPLES[index];
  const colourways: Colourway[] = sample.styleCode
    ? SAMPLES.filter((other) => other.styleCode === sample.styleCode).map((other) => ({
        slug: other.slug,
        colorName: other.colorName,
        colorHex: other.colorHex,
      }))
    : [{ slug: sample.slug, colorName: sample.colorName, colorHex: sample.colorHex }];

  return {
    ...CARDS[index],
    description: sample.description,
    details: sample.details,
    colorHex: sample.colorHex,
    variants: variantsOf(sample, index),
    colourways,
  };
}

export function previewRelated(product: Pick<ProductCard, "id" | "category">, limit = 4) {
  return CARDS.filter(
    (card) => card.category.slug === product.category.slug && card.id !== product.id,
  ).slice(0, limit);
}

export function previewCategories(): Category[] {
  return CATEGORIES.map((category) => ({
    ...category,
    description: null,
    productCount: SAMPLES.filter((sample) => sample.category === category.slug).length,
  }));
}

export function previewProductSlugs() {
  return SAMPLES.map((sample) => ({ slug: sample.slug, updatedAt: PUBLISHED }));
}

/** Current price and stock for bag lines, as checkout's quoteCart returns them. */
export function previewQuote(variantIds: string[]) {
  return SAMPLES.flatMap((sample, index) =>
    variantsOf(sample, index)
      .filter((variant) => variantIds.includes(variant.id))
      .map((variant) => ({
        variantId: variant.id,
        productId: CARDS[index].id,
        slug: sample.slug,
        name: sample.name,
        colorName: sample.colorName,
        size: variant.size,
        price: sample.price,
        imagePath: sample.image,
        available: variant.stock,
      })),
  );
}

/** The seeded (placeholder) delivery zones. The pickup point is inactive until confirmed. */
export const PREVIEW_DELIVERY: DeliveryOptions = {
  zones: [
    ["Abuja (FCT)", 3_000, 1, 2, ["FCT"]],
    ["North Central", 5_000, 2, 4, ["Benue", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"]],
    ["South West", 6_000, 2, 4, ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"]],
    [
      "South South & South East",
      6_500,
      3,
      5,
      [
        "Abia",
        "Akwa Ibom",
        "Anambra",
        "Bayelsa",
        "Cross River",
        "Delta",
        "Ebonyi",
        "Edo",
        "Enugu",
        "Imo",
        "Rivers",
      ],
    ],
    [
      "North West & North East",
      7_000,
      3,
      6,
      [
        "Adamawa",
        "Bauchi",
        "Borno",
        "Gombe",
        "Jigawa",
        "Kaduna",
        "Kano",
        "Katsina",
        "Kebbi",
        "Sokoto",
        "Taraba",
        "Yobe",
        "Zamfara",
      ],
    ],
  ].map(([name, fee, minDays, maxDays, states], index) => ({
    id: uuid(9000 + index),
    name: name as string,
    fee: (fee as number) * NAIRA,
    freeOver: null,
    minDays: minDays as number,
    maxDays: maxDays as number,
    states: states as string[],
  })),
  pickupLocations: [],
};
