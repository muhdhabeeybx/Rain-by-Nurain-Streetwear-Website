import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/money";
import { statusLabel } from "@/lib/orders/status";
import { isPreview } from "@/lib/preview";
import { createServerSupabase } from "@/lib/supabase/server";
import { AccountsSoon } from "./accounts-soon";
import { signOut } from "./actions";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeZone: "Africa/Lagos",
});

export default function AccountPage() {
  if (isPreview) return <AccountsSoon />;
  return (
    <div className="container-page pt-10 pb-24 md:pt-16">
      <Suspense fallback={<div aria-hidden className="h-96 animate-pulse bg-mist" />}>
        <AccountContent />
      </Suspense>
    </div>
  );
}

async function AccountContent() {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/account/sign-in");

  const [{ data: profile }, { data: orders, error }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", auth.claims.sub).maybeSingle(),
    supabase
      .from("orders")
      .select("number, status, fulfillment, total, created_at, items:order_items(quantity)")
      // Explicit: row level security also lets admins read every order.
      .eq("user_id", auth.claims.sub)
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false }),
  ]);
  if (error) throw new Error(`Could not load orders: ${error.message}`);

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="type-label text-muted">{String(auth.claims.email ?? "")}</p>
          <h1 className="mt-3 type-display text-display-lg">
            {profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Your account"}
          </h1>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="link">
            Sign out
          </Button>
        </form>
      </div>

      <div className="mt-14 grid gap-14 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="orders-heading">
          <h2 id="orders-heading" className="mb-4 type-label">
            Orders
          </h2>
          {orders.length === 0 ? (
            <div className="border-y border-line py-12 text-center">
              <p className="text-muted">No orders yet.</p>
              <Button asChild className="mt-6">
                <Link href="/shop">Shop the collection</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {orders.map((order) => {
                const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <li key={order.number}>
                    <Link
                      href={`/orders/${order.number}`}
                      className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-5 hover:bg-mist/60 md:grid-cols-[1fr_1fr_auto_auto] md:items-center"
                    >
                      <span className="font-mono text-sm">{order.number}</span>
                      <span className="font-mono text-sm md:order-last">
                        {formatNaira(order.total)}
                      </span>
                      <span className="text-sm text-muted">
                        {dateFormat.format(new Date(order.created_at))} · {count}{" "}
                        {count === 1 ? "item" : "items"}
                      </span>
                      <span className="type-label">
                        {statusLabel(order.status, order.fulfillment)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="lg:col-span-4 lg:col-start-9" aria-labelledby="details-heading">
          <h2 id="details-heading" className="mb-6 type-label">
            Your details
          </h2>
          <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} />
        </section>
      </div>
    </>
  );
}
