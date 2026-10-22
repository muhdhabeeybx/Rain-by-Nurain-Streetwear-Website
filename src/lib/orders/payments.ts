import "server-only";
import { after } from "next/server";
import { sendOrderConfirmation } from "@/lib/email/order-confirmation";
import type { PaystackTransaction } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Records a successful Paystack charge against its order. Safe to call from
 * both the payment redirect and the webhook: the database only marks an order
 * paid once, and only when the amount and currency match its total.
 *
 * Returns null when the transaction did not succeed.
 */
export async function recordPaystackPayment(transaction: PaystackTransaction) {
  if (transaction.status !== "success") return null;

  const { data, error } = await createServiceClient()
    .rpc("confirm_payment", {
      p_reference: transaction.reference,
      p_amount: transaction.amount,
      p_currency: transaction.currency,
      p_paid_at: transaction.paid_at ?? undefined,
    })
    .single();

  if (error) throw new Error(`Could not record payment ${transaction.reference}: ${error.message}`);

  if (data.newly_paid) {
    after(() => sendOrderConfirmation(data.order_id));
  }
  return data;
}

/** Releases an unpaid order's stock straight away. */
export async function cancelPendingOrder(reference: string, message: string) {
  const { data, error } = await createServiceClient().rpc("cancel_pending_order", {
    p_reference: reference,
    p_message: message,
  });
  if (error) throw new Error(`Could not cancel order ${reference}: ${error.message}`);
  return data;
}

/** The order number and guest access token for a payment reference. */
export async function findOrderByReference(reference: string) {
  const { data, error } = await createServiceClient()
    .from("orders")
    .select("number, access_token, status")
    .eq("payment_reference", reference)
    .maybeSingle();
  if (error) throw new Error(`Could not look up payment ${reference}: ${error.message}`);
  return data;
}
