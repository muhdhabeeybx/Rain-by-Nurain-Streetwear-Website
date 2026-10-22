import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { serverEnv } from "@/lib/env.server";

const API = "https://api.paystack.co";

export class PaystackError extends Error {
  name = "PaystackError";
}

async function request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${serverEnv().PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const body: unknown = await response.json().catch(() => null);
  const envelope = z
    .object({ status: z.boolean(), message: z.string(), data: z.unknown() })
    .safeParse(body);

  if (!response.ok || !envelope.success || !envelope.data.status) {
    const message = envelope.success ? envelope.data.message : `HTTP ${response.status}`;
    throw new PaystackError(`Paystack ${path.split("/")[2] ?? path}: ${message}`);
  }
  return schema.parse(envelope.data.data);
}

const initializedTransaction = z.object({
  authorization_url: z.url(),
  access_code: z.string(),
  reference: z.string(),
});

/** Starts a hosted Paystack checkout for an order and returns its payment URL. */
export function initializeTransaction(input: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  return request("/transaction/initialize", initializedTransaction, {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { ...input.metadata, cancel_action: input.cancelUrl },
    }),
  });
}

export const transactionSchema = z.object({
  reference: z.string(),
  status: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  paid_at: z.string().nullish(),
  channel: z.string().nullish(),
});

export type PaystackTransaction = z.infer<typeof transactionSchema>;

/** Asks Paystack for the authoritative state of a transaction. */
export function verifyTransaction(reference: string) {
  return request(`/transaction/verify/${encodeURIComponent(reference)}`, transactionSchema);
}

/** Checks the x-paystack-signature header: HMAC-SHA512 of the raw body. */
export function isValidWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", serverEnv().PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  const given = Buffer.from(signature, "utf8");
  const wanted = Buffer.from(expected, "utf8");
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}
