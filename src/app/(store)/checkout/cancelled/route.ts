import { type NextRequest, NextResponse } from "next/server";
import {
  cancelPendingOrder,
  findOrderByReference,
  recordPaystackPayment,
} from "@/lib/orders/payments";
import { verifyTransaction } from "@/lib/paystack";

/**
 * The customer pressed "Cancel" on the Paystack page. Release the stock right
 * away, unless Paystack says the payment actually went through.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const order = reference ? await findOrderByReference(reference) : null;
  if (!reference || !order) return NextResponse.redirect(new URL("/checkout", request.url));

  const transaction = await verifyTransaction(reference).catch(() => null);
  if (transaction?.status === "success") {
    await recordPaystackPayment(transaction);
    const destination = new URL(`/orders/${order.number}`, request.url);
    destination.searchParams.set("token", order.access_token);
    destination.searchParams.set("placed", "1");
    return NextResponse.redirect(destination);
  }

  // If Paystack can't be reached, leave the reservation to expire on its own.
  if (transaction) await cancelPendingOrder(reference, "Payment was cancelled.");
  return NextResponse.redirect(new URL("/checkout?payment=cancelled", request.url));
}
