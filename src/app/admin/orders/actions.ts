"use server";

import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { notifyStatusChange } from "@/lib/email/notify";

export type OrderActionState = { status: "idle" | "done" | "error"; message?: string };

const statusInput = z.object({
  orderId: z.uuid(),
  number: z.string(),
  status: z.enum(["processing", "shipped", "delivered", "cancelled", "refunded"]),
  message: z.string().trim().max(500).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  carrier: z.string().trim().max(100).optional(),
});

const TRANSITION_ERRORS: Record<string, string> = {
  invalid_transition:
    "That change isn't allowed from the order's current status. Refresh and try again.",
  forbidden: "You don't have permission to do that.",
};

export async function updateOrderStatus(
  _previous: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const { supabase } = await requireAdmin();
  const parsed = statusInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", message: "Something was missing from that update." };
  const input = parsed.data;

  const { data: order, error } = await supabase.rpc("update_order_status", {
    p_order_id: input.orderId,
    p_status: input.status,
    p_message: input.message || undefined,
    p_tracking_number: input.trackingNumber || undefined,
    p_carrier: input.carrier || undefined,
  });

  if (error) {
    return {
      status: "error",
      message: TRANSITION_ERRORS[error.message] ?? `Couldn't update: ${error.message}`,
    };
  }

  // Shipped, delivered, cancelled and refunded orders email the customer.
  after(() => notifyStatusChange(order.id, input.status));
  // Cancelling or refunding before dispatch puts stock back on sale.
  if (input.status === "cancelled" || input.status === "refunded") updateTag(CATALOG_TAG);
  revalidatePath(`/admin/orders/${input.number}`);
  return { status: "done", message: "Order updated." };
}

export async function resolveReview(
  _previous: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const { supabase } = await requireAdmin();
  const orderId = z.uuid().safeParse(formData.get("orderId"));
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 500);
  if (!orderId.success) return { status: "error", message: "Missing order." };
  if (!note) return { status: "error", message: "Add a short note about how you resolved it." };

  const { error } = await supabase.rpc("resolve_order_review", {
    p_order_id: orderId.data,
    p_note: note,
  });
  if (error) return { status: "error", message: `Couldn't resolve: ${error.message}` };

  revalidatePath(`/admin/orders/${formData.get("number")}`);
  return { status: "done", message: "Marked as resolved." };
}
