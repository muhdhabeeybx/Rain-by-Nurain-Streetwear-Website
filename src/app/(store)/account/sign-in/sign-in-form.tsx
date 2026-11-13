"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input } from "@/components/ui/field";
import { type SignInState, sendSignInCode, verifySignInCode } from "../actions";

export function SignInForm({ next }: { next: string }) {
  const [sent, sendCode, sending] = useActionState<SignInState, FormData>(sendSignInCode, {
    step: "email",
  });

  if (sent.step === "email") {
    return (
      <form action={sendCode} className="space-y-6">
        <Field
          label="Email"
          htmlFor="email"
          error={sent.error}
          hint="We'll email you a 6-digit code. No password needed."
        >
          <Input
            {...describedBy("email", sent.error, true)}
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={sending}>
          {sending ? "Sending…" : "Email me a code"}
        </Button>
      </form>
    );
  }

  return <CodeStep state={sent} next={next} />;
}

function CodeStep({
  state,
  next,
}: {
  state: Extract<SignInState, { step: "code" }>;
  next: string;
}) {
  const [result, verify, verifying] = useActionState<SignInState, FormData>(
    verifySignInCode,
    state,
  );
  const error = result.step === "code" ? result.error : undefined;

  return (
    <form action={verify} className="space-y-6">
      <p className="text-sm text-muted">
        We sent a code to <span className="text-ink">{state.email}</span>. It expires in an hour.
      </p>
      <input type="hidden" name="next" value={next} />
      <Field label="6-digit code" htmlFor="code" error={error}>
        <Input
          {...describedBy("code", error)}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          className="text-lg tracking-[0.5em] tabular-nums"
          required
          autoFocus
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={verifying}>
        {verifying ? "Checking…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted">
        Wrong email or no code?{" "}
        <a
          href={`/account/sign-in?next=${encodeURIComponent(next)}`}
          className="text-ink underline underline-offset-4"
        >
          Start again
        </a>
      </p>
    </form>
  );
}
