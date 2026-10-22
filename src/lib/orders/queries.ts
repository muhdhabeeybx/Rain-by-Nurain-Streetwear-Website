import "server-only";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Fulfillment, OrderStatus } from "./status";

export type OrderView = {
  id: string;
  number: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
  createdAt: string;
  paidAt: string | null;
  email: string;
  phone: string;
  fullName: string;
  address: { line1: string; line2: string | null; city: string; state: string } | null;
  pickup: {
    name: string;
    address: string;
    city: string;
    hours: string | null;
    instructions: string | null;
  } | null;
  deliveryNote: string | null;
  subtotal: number;
  deliveryFee: number;
  discountTotal: number;
  total: number;
  trackingNumber: string | null;
  carrier: string | null;
  accessToken: string;
  items: {
    id: string;
    productName: string;
    productSlug: string;
    colorName: string | null;
    size: string;
    imagePath: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  /** Customer-visible timeline, oldest first. */
  events: { id: number; status: OrderStatus | null; message: string; createdAt: string }[];
};

const ORDER_SELECT = `
  id, number, status, fulfillment, created_at, paid_at, email, phone, full_name,
  address_line1, address_line2, city, state, delivery_note,
  subtotal, delivery_fee, discount_total, total, tracking_number, carrier, access_token,
  pickup:pickup_locations(name, address, city, hours, instructions),
  items:order_items(id, product_name, product_slug, color_name, size, image_path, unit_price, quantity, line_total, created_at),
  events:order_events(id, status, message, is_internal, created_at)
`;

type OrderRow = {
  id: string;
  number: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
  created_at: string;
  paid_at: string | null;
  email: string;
  phone: string;
  full_name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  delivery_note: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_total: number;
  total: number;
  tracking_number: string | null;
  carrier: string | null;
  access_token: string;
  pickup: OrderView["pickup"];
  items: {
    id: string;
    product_name: string;
    product_slug: string;
    color_name: string | null;
    size: string;
    image_path: string | null;
    unit_price: number;
    quantity: number;
    line_total: number | null;
    created_at: string;
  }[];
  events: {
    id: number;
    status: OrderStatus | null;
    message: string;
    is_internal: boolean;
    created_at: string;
  }[];
};

function toView(row: OrderRow): OrderView {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    fulfillment: row.fulfillment,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    email: row.email,
    phone: row.phone,
    fullName: row.full_name,
    address:
      row.fulfillment === "delivery" && row.address_line1 && row.city && row.state
        ? { line1: row.address_line1, line2: row.address_line2, city: row.city, state: row.state }
        : null,
    pickup: row.pickup,
    deliveryNote: row.delivery_note,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    discountTotal: row.discount_total,
    total: row.total,
    trackingNumber: row.tracking_number,
    carrier: row.carrier,
    accessToken: row.access_token,
    items: row.items
      .toSorted((a, b) => a.created_at.localeCompare(b.created_at))
      .map((item) => ({
        id: item.id,
        productName: item.product_name,
        productSlug: item.product_slug,
        colorName: item.color_name,
        size: item.size,
        imagePath: item.image_path,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        lineTotal: item.line_total ?? item.unit_price * item.quantity,
      })),
    events: row.events
      .filter((event) => !event.is_internal)
      .toSorted((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id)
      .map((event) => ({
        id: event.id,
        status: event.status,
        message: event.message,
        createdAt: event.created_at,
      })),
  };
}

const ORDER_NUMBER = /^RBN-\d+$/;

/** A guest's order, opened with the private token from their confirmation link. */
export async function getOrderWithToken(number: string, token: string) {
  if (!ORDER_NUMBER.test(number) || !z.uuid().safeParse(token).success) return null;

  const { data, error } = await createServiceClient()
    .from("orders")
    .select(ORDER_SELECT)
    .eq("number", number)
    .eq("access_token", token)
    .maybeSingle<OrderRow>();

  if (error) throw new Error(`Could not load order ${number}: ${error.message}`);
  return data ? toView(data) : null;
}

/** An order belonging to the signed-in customer (row level security decides). */
export async function getCustomerOrder(number: string) {
  if (!ORDER_NUMBER.test(number)) return null;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("number", number)
    .maybeSingle<OrderRow>();

  if (error) throw new Error(`Could not load order ${number}: ${error.message}`);
  return data ? toView(data) : null;
}

/** Any order by id, for server-side jobs such as confirmation emails. */
export async function getOrderById(id: string) {
  const { data, error } = await createServiceClient()
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single<OrderRow>();

  if (error) throw new Error(`Could not load order ${id}: ${error.message}`);
  return toView(data);
}
