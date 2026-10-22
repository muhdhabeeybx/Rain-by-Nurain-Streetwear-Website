import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "sk_test_webhook_secret";

beforeEach(() => {
  vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
});

describe("isValidWebhookSignature", () => {
  const body = JSON.stringify({ event: "charge.success", data: { reference: "rbn_123" } });
  const sign = (payload: string, key = SECRET) =>
    createHmac("sha512", key).update(payload).digest("hex");

  it("accepts a body signed with our secret key", async () => {
    const { isValidWebhookSignature } = await import("./paystack");
    expect(isValidWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a missing, forged, or tampered signature", async () => {
    const { isValidWebhookSignature } = await import("./paystack");
    expect(isValidWebhookSignature(body, null)).toBe(false);
    expect(isValidWebhookSignature(body, sign(body, "sk_test_someone_else"))).toBe(false);
    expect(isValidWebhookSignature(body.replace("rbn_123", "rbn_999"), sign(body))).toBe(false);
    expect(isValidWebhookSignature(body, "short")).toBe(false);
  });
});
