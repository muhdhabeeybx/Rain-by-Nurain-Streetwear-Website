"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/redirects";
import { normalisePhone } from "@/lib/checkout/schema";
import { createServerSupabase } from "@/lib/supabase/server";

export type SignInState =
  { step: "email"; error?: string } | { step: "code"; email: string; error?: string };

export async function sendSignInCode(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = z.email().safeParse(
    String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
  );
  if (!email.success) return { step: "email", error: "Enter a valid email address." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error("[account] Could not send sign-in code", error.message);
    return {
      step: "email",
      error:
        error.status === 429
          ? "Too many attempts. Wait a minute, then try again."
          : "We couldn't send your code. Please try again.",
    };
  }
  return { step: "code", email: email.data };
}

export async function verifySignInCode(
  previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (previous.step !== "code") return { step: "email" };
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(token)) {
    return { ...previous, error: "Enter the 6-digit code from your email." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.verifyOtp({ email: previous.email, token, type: "email" });
  if (error) return { ...previous, error: "That code is incorrect or has expired." };

  // Orders placed as a guest with this (now verified) email join the account.
  const { error: claimError } = await supabase.rpc("claim_guest_orders");
  if (claimError) console.error("[account] Could not link guest orders", claimError.message);

  redirect(safeNextPath(formData.get("next")) as Route);
}

export async function signOut() {
  await (await createServerSupabase()).auth.signOut();
  redirect("/");
}

export type ProfileState = { status: "idle" | "saved" | "error"; message?: string };

export async function updateProfile(
  _previous: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const phone = rawPhone ? normalisePhone(rawPhone) : null;

  if (fullName.length > 100) return { status: "error", message: "That name is too long." };
  if (rawPhone && !phone) return { status: "error", message: "Enter a valid phone number." };

  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/account/sign-in");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null, phone })
    .eq("id", data.claims.sub);

  if (error)
    return { status: "error", message: "We couldn't save your details. Please try again." };
  return { status: "saved", message: "Saved." };
}
