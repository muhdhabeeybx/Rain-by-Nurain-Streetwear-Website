import "server-only";
import { serverEnv } from "@/lib/env.server";

type Email = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Where replies go. Customer emails reply to the shop; alerts reply to the customer. */
  replyTo?: string;
  /**
   * Resend sends a message once per key (for 24 hours), so a payment reported
   * by both the redirect and the webhook can't email anyone twice.
   */
  idempotencyKey?: string;
};

/**
 * Sends a transactional email through Resend. Returns false (and logs) when
 * email is not configured or sending fails, so email never breaks checkout.
 */
export async function sendEmail({ idempotencyKey, replyTo, ...email }: Email) {
  const { RESEND_API_KEY, EMAIL_FROM } = serverEnv();
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.warn(`[email] Not configured; skipped "${email.subject}"`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        ...email,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error(
        `[email] Resend rejected "${email.subject}": ${response.status} ${await response.text()}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email] Could not send "${email.subject}"`, error);
    return false;
  }
}
