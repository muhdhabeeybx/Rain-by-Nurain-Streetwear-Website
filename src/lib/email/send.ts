import "server-only";
import { serverEnv } from "@/lib/env.server";

type Email = { to: string; subject: string; html: string; text: string };

/**
 * Sends a transactional email through Resend. Returns false (and logs) when
 * email is not configured, so a missing provider never breaks checkout.
 */
export async function sendEmail(email: Email) {
  const { RESEND_API_KEY, EMAIL_FROM } = serverEnv();
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.warn(`[email] Not configured; skipped "${email.subject}" to ${email.to}`);
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: EMAIL_FROM, ...email }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    console.error(
      `[email] Resend rejected "${email.subject}": ${response.status} ${await response.text()}`,
    );
    return false;
  }
  return true;
}
