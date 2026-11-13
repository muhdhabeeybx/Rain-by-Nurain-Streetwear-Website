/**
 * Sample database rows for preview mode (see preview.ts): the products from
 * preview-catalog.ts plus a handful of made-up orders, shaped like the real
 * tables so the admin can show them. Order times are relative to now, so the
 * overview's "today / 7 days / 30 days" figures look alive.
 */
import type { Database } from "@/lib/supabase/database.types";
import {
  CATEGORIES,
  PREVIEW_DELIVERY,
  PUBLISHED,
  SAMPLES,
  uuid,
  variantsOf,
} from "./preview-catalog";

type Tables = Database["public"]["Tables"];
type Status = Database["public"]["Enums"]["order_status"];

const categoryId = (slug: string) => uuid(500 + CATEGORIES.findIndex((c) => c.slug === slug));
const PICKUP_ID = uuid(9500);

function catalogTables() {
  const categories = CATEGORIES.map((category, index) => ({
    id: uuid(500 + index),
    slug: category.slug,
    name: category.name,
    description: null,
    sort_order: (index + 1) * 10,
    created_at: PUBLISHED,
    updated_at: PUBLISHED,
  })) satisfies Tables["categories"]["Row"][];

  const products = SAMPLES.map((sample, index) => {
    const id = uuid(index + 1);
    const variants = variantsOf(sample, index).map((variant, sortOrder) => ({
      id: variant.id,
      product_id: id,
      size: variant.size,
      stock: variant.stock,
      sku: `RBN-${sample.slug
        .split("-")
        .map((word) => word[0])
        .join("")
        .toUpperCase()}-${variant.size}`,
      sort_order: sortOrder,
      created_at: PUBLISHED,
      updated_at: PUBLISHED,
    }));
    const category = categories.find((candidate) => candidate.slug === sample.category)!;
    return {
      id,
      slug: sample.slug,
      name: sample.name,
      description: sample.description,
      details: sample.details,
      style_code: sample.styleCode ?? null,
      color_name: sample.colorName,
      color_hex: sample.colorHex,
      price: sample.price,
      compare_at_price: sample.compareAtPrice ?? null,
      status: "active" as const,
      is_featured: Boolean(sample.featured),
      sort_order: index,
      category_id: categoryId(sample.category),
      search: null,
      published_at: PUBLISHED,
      created_at: PUBLISHED,
      updated_at: PUBLISHED,
      // Embedded relations, under the names the admin's queries use.
      category: { name: category.name, slug: category.slug },
      images: [
        {
          id: uuid(3000 + index),
          product_id: id,
          path: sample.image,
          alt: sample.alt,
          sort_order: 0,
          width: null,
          height: null,
          created_at: PUBLISHED,
        },
      ],
      variants,
    };
  });

  const variants = products.flatMap((product) =>
    product.variants.map((variant) => ({
      ...variant,
      product: {
        id: product.id,
        name: product.name,
        color_name: product.color_name,
        status: product.status,
      },
    })),
  );

  return { categories, products, variants };
}

function deliveryTables() {
  const zones = PREVIEW_DELIVERY.zones.map((zone, index) => ({
    id: zone.id,
    name: zone.name,
    fee: zone.fee,
    free_over: zone.freeOver,
    min_days: zone.minDays,
    max_days: zone.maxDays,
    is_active: true,
    sort_order: (index + 1) * 10,
    created_at: PUBLISHED,
    updated_at: PUBLISHED,
  })) satisfies Tables["delivery_zones"]["Row"][];

  const zoneStates = PREVIEW_DELIVERY.zones.flatMap((zone) =>
    zone.states.map((state) => ({ state, zone_id: zone.id })),
  );

  const pickup = [
    {
      id: PICKUP_ID,
      name: "RBN Studio",
      address: "Address to be confirmed",
      city: "Abuja",
      state: "FCT",
      hours: "Mon–Sat, 10am–6pm",
      instructions: null,
      is_active: false,
      sort_order: 10,
      created_at: PUBLISHED,
      updated_at: PUBLISHED,
    },
  ] satisfies Tables["pickup_locations"]["Row"][];

  return { zones, zoneStates, pickup };
}

type SampleOrder = {
  status: Status;
  hoursAgo: number;
  name: string;
  state: string | null;
  city?: string;
  items: [sampleIndex: number, size: string, quantity: number][];
  review?: string;
  tracking?: [number: string, carrier: string];
};

const SAMPLE_ORDERS: SampleOrder[] = [
  {
    status: "delivered",
    hoursAgo: 24 * 21,
    name: "Ibrahim Musa",
    state: "Kano",
    items: [[1, "L", 1]],
  },
  {
    status: "cancelled",
    hoursAgo: 24 * 9,
    name: "Chiamaka Eze",
    state: "Enugu",
    items: [[4, "M", 1]],
  },
  {
    status: "delivered",
    hoursAgo: 24 * 4,
    name: "Amina Bello",
    state: "FCT",
    city: "Wuse 2",
    items: [
      [0, "M", 1],
      [2, "L", 2],
    ],
  },
  {
    status: "shipped",
    hoursAgo: 50,
    name: "Tobi Adeyemi",
    state: "Lagos",
    city: "Lekki",
    items: [
      [5, "M", 1],
      [2, "M", 1],
    ],
    tracking: ["GIG-88213409", "GIG Logistics"],
  },
  {
    status: "paid",
    hoursAgo: 26,
    name: "Fatima Sani",
    state: "Kaduna",
    items: [[3, "M", 1]],
    review:
      "Payment arrived after the reservation expired and some items are no longer in stock. Refund or restock before fulfilling.",
  },
  {
    status: "processing",
    hoursAgo: 5,
    name: "Emeka Obi",
    state: "Rivers",
    city: "Port Harcourt",
    items: [[1, "M", 1]],
  },
  {
    status: "paid",
    hoursAgo: 2,
    name: "Zainab Yusuf",
    state: null,
    items: [
      [0, "S", 1],
      [4, "L", 1],
    ],
  },
  {
    status: "paid",
    hoursAgo: 1,
    name: "David Okon",
    state: "FCT",
    city: "Garki",
    items: [[0, "XL", 2]],
  },
  {
    status: "pending_payment",
    hoursAgo: 0.2,
    name: "Halima Bako",
    state: "Plateau",
    items: [[2, "S", 1]],
  },
];

const EVENT_MESSAGES: Partial<Record<Status, string>> = {
  paid: "Payment confirmed.",
  processing: "We are preparing your order.",
  shipped: "Your order is on its way.",
  delivered: "Your order was delivered.",
  cancelled: "Your order was cancelled.",
};

const PATH: Record<Status, Status[]> = {
  pending_payment: [],
  paid: ["paid"],
  processing: ["paid", "processing"],
  shipped: ["paid", "processing", "shipped"],
  delivered: ["paid", "processing", "shipped", "delivered"],
  cancelled: ["paid", "cancelled"],
  refunded: ["paid", "refunded"],
};

function orderRows(now: number, pickupId: string) {
  return SAMPLE_ORDERS.map((sample, index) => {
    const id = uuid(7000 + index);
    const number = `RBN-${1001 + index}`;
    const createdAt = new Date(now - sample.hoursAgo * 3_600_000);
    const at = (minutesLater: number) =>
      new Date(createdAt.getTime() + minutesLater * 60_000).toISOString();
    const pickup = sample.state === null;
    const zone = pickup
      ? null
      : (PREVIEW_DELIVERY.zones.find((candidate) => candidate.states.includes(sample.state!)) ??
        null);
    const firstName = sample.name.split(" ")[0].toLowerCase();

    const items = sample.items.map(([sampleIndex, size, quantity], itemIndex) => {
      const product = SAMPLES[sampleIndex];
      const variant = variantsOf(product, sampleIndex).find(
        (candidate) => candidate.size === size,
      )!;
      return {
        id: uuid(7500 + index * 10 + itemIndex),
        order_id: id,
        product_id: uuid(sampleIndex + 1),
        variant_id: variant.id,
        product_name: product.name,
        product_slug: product.slug,
        color_name: product.colorName,
        size,
        image_path: product.image,
        unit_price: product.price,
        quantity,
        line_total: product.price * quantity,
        created_at: at(itemIndex),
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const deliveryFee = zone?.fee ?? 0;

    const events = [
      ...PATH[sample.status].map((status, step) => ({
        id: index * 10 + step + 1,
        order_id: id,
        status,
        message:
          status === "shipped" && pickup
            ? "Your order is ready for pickup."
            : (EVENT_MESSAGES[status] ?? "Updated."),
        is_internal: false,
        created_by: null,
        created_at: at(step === 0 ? 2 : step * 60 * Math.min(sample.hoursAgo / 4, 20)),
      })),
      ...(sample.review
        ? [
            {
              id: index * 10 + 9,
              order_id: id,
              status: null,
              message: sample.review,
              is_internal: true,
              created_by: null,
              created_at: at(2),
            },
          ]
        : []),
    ];

    return {
      id,
      number,
      user_id: null,
      email: `${firstName}@example.com`,
      phone: `+234 803 000 ${String(1001 + index).padStart(4, "0")}`,
      full_name: sample.name,
      fulfillment: pickup ? ("pickup" as const) : ("delivery" as const),
      address_line1: pickup ? null : `${12 + index} Sample Street`,
      address_line2: null,
      city: pickup ? null : (sample.city ?? sample.state),
      state: sample.state,
      delivery_zone_id: zone?.id ?? null,
      pickup_location_id: pickup ? pickupId : null,
      delivery_note: index === 7 ? "Please call when you're at the gate." : null,
      subtotal,
      delivery_fee: deliveryFee,
      discount_total: 0,
      total: subtotal + deliveryFee,
      currency: "NGN",
      status: sample.status,
      payment_reference: `rbn_preview_${index}`,
      paid_at: sample.status === "pending_payment" ? null : at(2),
      reserved_until: sample.status === "pending_payment" ? at(30) : null,
      needs_review: Boolean(sample.review),
      review_reason: sample.review ?? null,
      tracking_number: sample.tracking?.[0] ?? null,
      carrier: sample.tracking?.[1] ?? null,
      access_token: uuid(8000 + index),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      // Embedded relations.
      pickup: pickup
        ? {
            name: "RBN Studio",
            address: "Address to be confirmed",
            city: "Abuja",
            hours: "Mon–Sat, 10am–6pm",
            instructions: null,
          }
        : null,
      items,
      events,
    };
  });
}

/** Every sample table, keyed by table name. Built fresh so times track the clock. */
export function previewTables(now = Date.now()) {
  const catalog = catalogTables();
  const delivery = deliveryTables();
  return {
    categories: catalog.categories,
    products: catalog.products,
    product_variants: catalog.variants,
    product_images: catalog.products.flatMap((product) => product.images),
    delivery_zones: delivery.zones,
    delivery_zone_states: delivery.zoneStates,
    pickup_locations: delivery.pickup,
    orders: orderRows(now, PICKUP_ID),
  } satisfies Record<string, Record<string, unknown>[]>;
}

/** The sample order shown after a preview checkout. */
export const PREVIEW_PLACED_ORDER = "RBN-1008";
