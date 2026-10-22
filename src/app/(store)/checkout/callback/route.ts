import { type NextRequest, NextResponse } from "next/server";
import {
  cancelPendingOrder,
  findOrderByReference,
  recordPaystackPayment,
} from "@/lib/orders/payments";
import { verifyTransaction } from "@/lib/paystack";

const FAILED = new Set(["failed", "abandoned", "reversed"]);

/**
 * Paystack sends the customer here after checkout. We confirm the payment with
 * Paystack directly (never trusting the URL), then show the order.
 */
export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref");
  const order = reference ? await findOrderByReference(reference) : null;
  if (!reference || !order) return NextResponse.redirect(new URL("/checkout", request.url));

  try {
    const transaction = await verifyTransaction(reference);
    if (transaction.status === "success") {
      await recordPaystackPayment(transaction);
    } else if (FAILED.has(transaction.status)) {
      await cancelPendingOrder(reference, "Payment was not completed.");
      return NextResponse.redirect(new URL("/checkout?payment=failed", request.url));
    }
  } catch (error) {
    // The webhook will still confirm the payment; the order page shows it as pending.
    console.error(`[checkout] Could not verify ${reference} on return`, error);
  }

  const destination = new URL(`/orders/${order.number}`, request.url);
  destination.searchParams.set("token", order.access_token);
  destination.searchParams.set("placed", "1");
  return NextResponse.redirect(destination);
}
