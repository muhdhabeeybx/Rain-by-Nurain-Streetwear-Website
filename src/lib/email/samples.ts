/**
 * Made-up orders for previewing and testing emails. Never sent to anyone.
 */
import type { OrderView } from "@/lib/orders/queries";

const NAIRA = 100;

export const sampleDeliveryOrder: OrderView = {
  id: "00000000-0000-4000-8000-000000001042",
  number: "RBN-1042",
  status: "paid",
  fulfillment: "delivery",
  createdAt: "2026-11-13T09:12:00.000Z",
  paidAt: "2026-11-13T09:14:00.000Z",
  email: "amina@example.com",
  phone: "+234 803 123 4567",
  fullName: "Amina Bello",
  address: { line1: "14 Aminu Kano Crescent", line2: "Flat 3", city: "Wuse 2", state: "FCT" },
  pickup: null,
  deliveryNote: "Please call when you're at the gate.",
  subtotal: 66_000 * NAIRA,
  deliveryFee: 3_500 * NAIRA,
  discountTotal: 0,
  total: 69_500 * NAIRA,
  trackingNumber: "GIG-88213409",
  carrier: "GIG Logistics",
  accessToken: "5f1c2a9e-8d4b-4c1e-9a7f-2b6d3e8c1a90",
  items: [
    {
      id: "item-1",
      productName: "Left Home Hoodie",
      productSlug: "left-home-hoodie-black",
      colorName: "Black",
      size: "L",
      imagePath: "sample/hoodie.jpg",
      unitPrice: 38_000 * NAIRA,
      quantity: 1,
      lineTotal: 38_000 * NAIRA,
    },
    {
      id: "item-2",
      productName: "Hustlers & Dreamers Tee",
      productSlug: "hustlers-dreamers-tee-bone",
      colorName: "Bone",
      size: "M",
      imagePath: "sample/tee.jpg",
      unitPrice: 14_000 * NAIRA,
      quantity: 2,
      lineTotal: 28_000 * NAIRA,
    },
  ],
  events: [],
};

export const samplePickupOrder: OrderView = {
  ...sampleDeliveryOrder,
  id: "00000000-0000-4000-8000-000000001043",
  number: "RBN-1043",
  fulfillment: "pickup",
  fullName: "Tunde Okafor",
  email: "tunde@example.com",
  address: null,
  pickup: {
    name: "RBN Studio",
    address: "Plot 7, Gimbiya Street, Area 11",
    city: "Garki, Abuja",
    hours: "Mon–Sat, 11am–6pm",
    instructions: "Ring the bell at the black gate.",
  },
  deliveryNote: null,
  deliveryFee: 0,
  total: 66_000 * NAIRA,
  trackingNumber: null,
  carrier: null,
};

/** The sample order at a later status. */
export function sampleAt(order: OrderView, status: OrderView["status"]): OrderView {
  return { ...order, status };
}

export const SAMPLE_REVIEW_REASON =
  "Payment amount mismatch: received 60,000.00 NGN, expected 69,500.00 NGN. Do not fulfil until resolved.";
