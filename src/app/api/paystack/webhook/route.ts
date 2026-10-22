import { z } from "zod";
import { recordPaystackPayment } from "@/lib/orders/payments";
import { isValidWebhookSignature, transactionSchema } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";

const eventSchema = z.object({ event: z.string(), data: z.unknown() });

/**
 * Paystack → Settings → API Keys & Webhooks → Webhook URL:
 *   https://<your-domain>/api/paystack/webhook
 *
 * Confirms payments even if the customer closes the tab before returning.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!isValidWebhookSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = eventSchema.safeParse(JSON.parse(rawBody));
  if (!event.success) return new Response("Unrecognised payload", { status: 400 });

  const transaction = transactionSchema.safeParse(event.data.data);
  const reference = transaction.success ? transaction.data.reference : null;

  const { error: logError } = await createServiceClient()
    .from("payment_events")
    .insert({ event: event.data.event, reference, payload: event.data.data as never });
  if (logError) console.error("[paystack] Could not log webhook", logError);

  if (event.data.event === "charge.success" && transaction.success) {
    try {
      await recordPaystackPayment(transaction.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("order_not_found")) {
        // Not one of our checkouts (e.g. a payment link); acknowledge it.
        return new Response(null, { status: 200 });
      }
      console.error("[paystack] Could not record payment", error);
      return new Response("Could not record payment", { status: 500 }); // Paystack retries
    }
  }

  return new Response(null, { status: 200 });
}
