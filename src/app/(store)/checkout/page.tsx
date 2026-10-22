import type { Metadata } from "next";
import { Suspense } from "react";
import { getDeliveryOptions } from "@/lib/delivery";
import { createServerSupabase } from "@/lib/supabase/server";
import { type CheckoutDefaults, CheckoutForm, CheckoutSkeleton } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

const NOTICES: Record<string, string> = {
  failed:
    "Your payment didn't go through and you have not been charged. Your bag is still here when you're ready to try again.",
  cancelled: "Payment cancelled. You have not been charged, and your bag is still here.",
};

export default function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  return (
    <div className="container-page pt-8 pb-24 md:pt-12">
      <h1 className="type-display text-display-md">Checkout</h1>
      <Suspense fallback={<CheckoutSkeleton />}>
        {searchParams.then(({ payment }) => (
          <CheckoutLoader
            notice={typeof payment === "string" ? (NOTICES[payment] ?? null) : null}
          />
        ))}
      </Suspense>
    </div>
  );
}

async function CheckoutLoader({ notice }: { notice: string | null }) {
  const [options, defaults] = await Promise.all([getDeliveryOptions(), getCheckoutDefaults()]);
  return <CheckoutForm options={options} defaults={defaults} notice={notice} />;
}

/** Pre-fills contact details for signed-in customers. */
async function getCheckoutDefaults(): Promise<CheckoutDefaults> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { email: "", fullName: "", phone: "" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", data.claims.sub)
    .maybeSingle();

  return {
    email: typeof data.claims.email === "string" ? data.claims.email : "",
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
  };
}
