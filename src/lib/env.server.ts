import "server-only";
import { z } from "zod";

const schema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
  PAYSTACK_SECRET_KEY: z
    .string()
    .regex(/^sk_(test|live)_/, "PAYSTACK_SECRET_KEY must start with sk_test_ or sk_live_"),
  // Optional until a sending domain is verified. Without them, emails are skipped.
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  EMAIL_FROM: z.string().min(3).optional(),
});

let parsed: z.infer<typeof schema> | undefined;

/**
 * Server-only secrets. Read lazily so pages that never touch payments can
 * still be built without them.
 */
export function serverEnv() {
  parsed ??= schema.parse(process.env);
  return parsed;
}
