import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/admin/auth";
import { formatNaira } from "@/lib/money";

const LOW_STOCK = 3;
const SALE_STATUSES = ["paid", "processing", "shipped", "delivered"] as const;

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse bg-mist" />}>
      <Overview />
    </Suspense>
  );
}

/** Midnight today in Lagos, as an ISO timestamp. */
function startOfTodayInLagos(now: Date) {
  const lagos = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
  const offset = lagos.getTime() - now.getTime();
  lagos.setHours(0, 0, 0, 0);
  return new Date(lagos.getTime() - offset);
}

async function Overview() {
  const { supabase } = await requireAdmin();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

  const [sales, toFulfil, review, lowStock, recent] = await Promise.all([
    supabase
      .from("orders")
      .select("total, paid_at")
      .in("status", SALE_STATUSES)
      .gte("paid_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "processing"]),
    supabase
      .from("orders")
      .select("number, review_reason")
      .eq("needs_review", true)
      .order("created_at"),
    supabase
      .from("product_variants")
      .select("size, stock, product:products!inner(id, name, color_name, status)")
      .lte("stock", LOW_STOCK)
      .eq("product.status", "active")
      .order("stock"),
    supabase
      .from("orders")
      .select("number, full_name, total, status, fulfillment, created_at")
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  for (const result of [sales, toFulfil, review, lowStock, recent]) {
    if (result.error) throw new Error(`Could not load the overview: ${result.error.message}`);
  }

  const today = startOfTodayInLagos(now).getTime();
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const paid = sales.data ?? [];
  const sum = (since: number) =>
    paid
      .filter((order) => order.paid_at && Date.parse(order.paid_at) >= since)
      .reduce((total, order) => total + order.total, 0);
  const count = (since: number) =>
    paid.filter((order) => order.paid_at && Date.parse(order.paid_at) >= since).length;

  const stats = [
    { label: "Sales today", value: formatNaira(sum(today)), detail: `${count(today)} orders` },
    { label: "Last 7 days", value: formatNaira(sum(weekAgo)), detail: `${count(weekAgo)} orders` },
    { label: "Last 30 days", value: formatNaira(sum(0)), detail: `${paid.length} orders` },
    {
      label: "To fulfil",
      value: String(toFulfil.count ?? 0),
      detail: "paid, not yet dispatched",
      href: "/admin/orders" as const,
    },
  ];

  return (
    <>
      <h1 className="type-display text-display-md">Overview</h1>

      {(review.data?.length ?? 0) > 0 && (
        <section className="mt-8 border border-signal p-5" aria-labelledby="review-heading">
          <h2 id="review-heading" className="type-label text-signal">
            Needs your attention
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {review.data?.map((order) => (
              <li key={order.number}>
                <Link
                  href={`/admin/orders/${order.number}`}
                  className="tabular-nums underline underline-offset-4"
                >
                  {order.number}
                </Link>{" "}
                {order.review_reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      <dl className="mt-8 grid grid-cols-2 border-t border-l border-line lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-r border-b border-line p-5">
            <dt className="type-label text-muted">{stat.label}</dt>
            <dd className="mt-3 text-2xl tabular-nums">
              {stat.href ? (
                <Link href={stat.href} className="underline-offset-4 hover:underline">
                  {stat.value}
                </Link>
              ) : (
                stat.value
              )}
            </dd>
            <dd className="mt-1 text-sm text-muted">{stat.detail}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-12 xl:grid-cols-2">
        <section aria-labelledby="recent-heading">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="recent-heading" className="type-label">
              Recent orders
            </h2>
            <Link href="/admin/orders?status=all" className="type-label text-muted hover:text-ink">
              All orders →
            </Link>
          </div>
          {recent.data?.length ? (
            <ul className="divide-y divide-line border-y border-line">
              {recent.data.map((order) => (
                <li key={order.number}>
                  <Link
                    href={`/admin/orders/${order.number}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 text-sm hover:bg-mist/60 sm:grid-cols-[7rem_1fr_auto_auto]"
                  >
                    <span className="tabular-nums">{order.number}</span>
                    <span className="truncate text-muted max-sm:order-3">
                      {order.full_name} · {dateFormat.format(new Date(order.created_at))}
                    </span>
                    <span className="tabular-nums">{formatNaira(order.total)}</span>
                    <span className="max-sm:order-4 max-sm:justify-self-end">
                      <StatusBadge status={order.status} fulfillment={order.fulfillment} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-y border-line py-8 text-sm text-muted">No orders yet.</p>
          )}
        </section>

        <section aria-labelledby="stock-heading">
          <h2 id="stock-heading" className="mb-4 type-label">
            Low stock (≤ {LOW_STOCK})
          </h2>
          {lowStock.data?.length ? (
            <ul className="divide-y divide-line border-y border-line">
              {lowStock.data.map((variant) => (
                <li key={`${variant.product.id}-${variant.size}`}>
                  <Link
                    href={`/admin/products/${variant.product.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm hover:bg-mist/60"
                  >
                    <span className="truncate">
                      {variant.product.name}
                      {variant.product.color_name && (
                        <span className="text-muted"> · {variant.product.color_name}</span>
                      )}
                      <span className="text-muted"> · {variant.size}</span>
                    </span>
                    <span
                      className={variant.stock === 0 ? "text-signal tabular-nums" : "tabular-nums"}
                    >
                      {variant.stock === 0 ? "Sold out" : `${variant.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-y border-line py-8 text-sm text-muted">
              Everything is well stocked.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
