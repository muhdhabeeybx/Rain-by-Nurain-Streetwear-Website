import type { Database } from "@/lib/supabase/database.types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type Fulfillment = Database["public"]["Enums"]["fulfillment_method"];

/** How each status reads to a customer. */
export function statusLabel(status: OrderStatus, fulfillment: Fulfillment) {
  switch (status) {
    case "pending_payment":
      return "Awaiting payment";
    case "paid":
      return "Confirmed";
    case "processing":
      return "Being prepared";
    case "shipped":
      return fulfillment === "pickup" ? "Ready for pickup" : "On its way";
    case "delivered":
      return fulfillment === "pickup" ? "Collected" : "Delivered";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
  }
}

/** The happy path, used to draw progress on the order page. */
export const ORDER_PROGRESS: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];
