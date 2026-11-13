"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { CATALOG_TAG } from "@/lib/catalog";
import { type CheckoutField, checkoutSchema } from "@/lib/checkout/schema";
import { env } from "@/lib/env";
import { cancelPendingOrder } from "@/lib/orders/payments";
import { isPreview } from "@/lib/preview";
import { previewQuote } from "@/lib/preview-catalog";
import { initializeTransaction } from "@/lib/paystack";
import { createPublicClient } from "@/lib/supabase/public";
import { createServerSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type QuoteLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  colorName: string | null;
  size: string;
  price: number;
  imagePath: string | null;
  available: number;
};

/**
 * Current price and stock for each variant in the bag. Variants that no longer
 * exist or are no longer on sale are left out.
 */
export async function quoteCart(variantIds: string[]): Promise<QuoteLine[]> {
  const ids = z.array(z.uuid()).max(20).parse(variantIds);
  if (ids.length === 0) return [];
  if (isPreview) return previewQuote(ids);

  const { data, error } = await createPublicClient()
    .from("product_variants")
    .select(
      "id, size, stock, product:products!inner(id, slug, name, color_name, price, status, images:product_images(path, sort_order))",
    )
    .in("id", ids)
    .eq("product.status", "active");

  if (error) throw new Error(`Could not price the bag: ${error.message}`);

  return data.map((variant) => ({
    variantId: variant.id,
    productId: variant.product.id,
    slug: variant.product.slug,
    name: variant.product.name,
    colorName: variant.product.color_name,
    size: variant.size,
    price: variant.product.price,
    imagePath:
      variant.product.images.toSorted((a, b) => a.sort_order - b.sort_order)[0]?.path ?? null,
    available: variant.stock,
  }));
}

export type PlaceOrderState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<CheckoutField, string>>;
      /** Set when stock changed; the bag should be re-quoted. */
      stockChanged?: boolean;
    }
  | { status: "redirect"; url: string; orderNumber: string };

const GENERIC_ERROR =
  "Something went wrong placing your order. You have not been charged. Please try again.";

export async function placeOrder(
  _previous: PlaceOrderState,
  formData: FormData,
): Promise<PlaceOrderState> {
  if (isPreview) return { status: "error", message: "Checkout opens soon. This is a preview." };
  const fields = Object.fromEntries(formData) as Record<string, string>;
  const parsed = checkoutSchema.safeParse({ ...fields, items: parseItems(fields.items) });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<CheckoutField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as CheckoutField | "items";
      if (field === "items") return { status: "error", message: issue.message, stockChanged: true };
      fieldErrors[field] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted details.", fieldErrors };
  }
  const input = parsed.data;

  // Attach the order to the customer's account when they are signed in.
  const { data: auth } = await (await createServerSupabase()).auth.getClaims();

  const { data: order, error } = await createServiceClient().rpc("create_order", {
    p_email: input.email,
    p_phone: input.phone,
    p_full_name: input.fullName,
    p_fulfillment: input.fulfillment,
    p_items: input.items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
    p_user_id: auth?.claims.sub,
    ...(input.fulfillment === "delivery"
      ? {
          p_address_line1: input.addressLine1,
          p_address_line2: input.addressLine2,
          p_city: input.city,
          p_state: input.state,
          p_delivery_note: input.deliveryNote,
        }
      : { p_pickup_location_id: input.pickupLocationId }),
  });

  if (error) return orderError(error);

  // Stock was just reserved, so product pages should refresh.
  revalidateTag(CATALOG_TAG, "max");

  try {
    const payment = await initializeTransaction({
      email: order.email,
      amount: order.total,
      reference: order.payment_reference,
      callbackUrl: `${env.NEXT_PUBLIC_SITE_URL}/checkout/callback`,
      cancelUrl: `${env.NEXT_PUBLIC_SITE_URL}/checkout/cancelled?reference=${order.payment_reference}`,
      metadata: { order_id: order.id, order_number: order.number },
    });
    return { status: "redirect", url: payment.authorization_url, orderNumber: order.number };
  } catch (cause) {
    console.error(`[checkout] Could not start payment for ${order.number}`, cause);
    await cancelPendingOrder(order.payment_reference, "Payment could not be started.").catch(
      (cancelError) => console.error(`[checkout] Could not release ${order.number}`, cancelError),
    );
    return {
      status: "error",
      message:
        "We couldn't reach our payment provider. You have not been charged. Please try again.",
    };
  }
}

function parseItems(raw: string | undefined): unknown {
  try {
    return JSON.parse(raw ?? "[]");
  } catch {
    return [];
  }
}

function orderError(error: { message: string; details: string | null }): PlaceOrderState {
  switch (error.message) {
    case "insufficient_stock":
    case "product_unavailable":
      return {
        status: "error",
        message:
          "Some pieces in your bag have sold out or have fewer left. We've updated your bag.",
        stockChanged: true,
      };
    case "delivery_unavailable":
      return {
        status: "error",
        message: "We can't deliver to that state right now.",
        fieldErrors: { state: "Delivery to this state isn't available yet." },
      };
    case "pickup_unavailable":
      return {
        status: "error",
        message: "That pickup location is no longer available. Please choose delivery instead.",
      };
    default:
      console.error("[checkout] create_order failed", error);
      return { status: "error", message: GENERIC_ERROR };
  }
}
