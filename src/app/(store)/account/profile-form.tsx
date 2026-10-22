"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useFormAction } from "@/lib/use-form-action";
import { type ProfileState, updateProfile } from "./actions";

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const [state, onSubmit, saving] = useFormAction<ProfileState>(updateProfile, { status: "idle" });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Full name" htmlFor="fullName">
        <Input id="fullName" name="fullName" autoComplete="name" defaultValue={fullName} />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={phone} />
      </Field>
      <div className="flex items-center gap-4">
        <Button type="submit" variant="secondary" disabled={saving}>
          {saving ? "Saving…" : "Save details"}
        </Button>
        {state.message && (
          <p
            role="status"
            className={state.status === "error" ? "text-sm text-signal" : "text-sm text-muted"}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
