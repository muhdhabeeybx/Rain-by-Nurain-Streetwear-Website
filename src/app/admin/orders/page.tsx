import type { Metadata, Route } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/admin/auth";
import { formatNaira } from "@/lib/money";
import type { OrderStatus } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

const FILTERS = {
  "to-fulfil": { label: "To fulfil", statuses: ["paid", "processing"] },
  shipped: { label: "Dispatched", statuses: ["shipped"] },
  completed: { label: "Completed", statuses: ["delivered"] },
  closed: { label: "Cancelled & refunded", statuses: ["cancelled", "refunded"] },
  unpaid: { label: "Unpaid", statuses: ["pending_payment"] },
  all: { label: "All", statuses: null },
} as const satisfies Record<string, { label: string; statuses: OrderStatus[] | null }>;

type FilterKey = keyof typeof FILTERS;

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <>
      <h1 className="type-display text-display-md">Orders</h1>
      <Suspense fallback={<div aria-hidden className="mt-8 h-96 animate-pulse bg-mist" />}>
        {searchParams.then(({ status, q }) => (
          <OrdersTable
            filter={
              typeof status === "string" && status in FILTERS ? (status as FilterKey) : "to-fulfil"
            }
            query={typeof q === "string" ? q.trim().slice(0, 100) : ""}
          />
        ))}
      </Suspense>
    </>
  );
}

async function OrdersTable({ filter, query }: { filter: FilterKey; query: string }) {
  const { supabase } = await requireAdmin();

  let request = supabase
    .from("orders")
    .select(
      "number, full_name, email, total, status, fulfillment, state, needs_review, created_at, items:order_items(quantity)",
    )
    .order("created_at", { ascending: filter === "to-fulfil" })
    .limit(200);
  const statuses = FILTERS[filter].statuses;
  if (statuses) request = request.in("status", statuses);
  if (query) {
    const term = query.replace(/[%,()]/g, " ");
    request = request.or(`number.ilike.%${term}%,email.ilike.%${term}%,full_name.ilike.%${term}%`);
  }

  const { data: orders, error } = await request;
  if (error) throw new Error(`Could not load orders: ${error.message}`);

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter orders" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <ul className="flex gap-2">
            {(Object.keys(FILTERS) as FilterKey[]).map((key) => (
              <li key={key}>
                <Link
                  href={`/admin/orders?status=${key}` as Route}
                  aria-current={key === filter ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center border px-3 type-label whitespace-nowrap",
                    key === filter
                      ? "border-ink bg-ink text-paper"
                      : "border-line-strong hover:border-ink",
                  )}
                >
                  {FILTERS[key].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Form action="/admin/orders" role="search" className="flex gap-2">
          <input type="hidden" name="status" value="all" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Order no., name or email"
            aria-label="Search orders"
            className="h-9 w-full border border-line-strong bg-transparent px-3 text-sm focus:border-ink focus:outline-none lg:w-64"
          />
        </Form>
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 border-y border-line py-12 text-center text-sm text-muted">
          {query ? `No orders match “${query}”.` : "Nothing here right now."}
        </p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-line border-y border-line md:hidden">
            {orders.map((order) => (
              <li key={order.number}>
                <Link
                  href={`/admin/orders/${order.number}`}
                  className="flex flex-col gap-2 py-4 text-sm"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-mono">
                      {order.number}
                      {order.needs_review && (
                        <span className="ml-2 type-label text-signal">Review</span>
                      )}
                    </span>
                    <StatusBadge status={order.status} fulfillment={order.fulfillment} />
                  </span>
                  <span className="flex items-center justify-between gap-3 text-muted">
                    <span className="truncate">
                      {order.full_name} · {order.fulfillment === "pickup" ? "Pickup" : order.state}
                    </span>
                    <span className="font-mono text-ink">{formatNaira(order.total)}</span>
                  </span>
                  <span className="text-muted">
                    {dateFormat.format(new Date(order.created_at))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full min-w-3xl text-left text-sm">
              <thead className="border-b border-ink type-label text-muted">
                <tr>
                  <th className="py-3 pr-4 font-medium">Order</th>
                  <th className="py-3 pr-4 font-medium">Placed</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Items</th>
                  <th className="py-3 pr-4 font-medium">Total</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.number} className="border-b border-line hover:bg-mist/60">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/orders/${order.number}`}
                        className="font-mono underline-offset-4 hover:underline"
                      >
                        {order.number}
                      </Link>
                      {order.needs_review && (
                        <span className="ml-2 type-label text-signal">Review</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">
                      {dateFormat.format(new Date(order.created_at))}
                    </td>
                    <td className="py-3 pr-4">
                      {order.full_name}
                      <span className="block text-muted">
                        {order.fulfillment === "pickup" ? "Pickup" : order.state}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="py-3 pr-4 font-mono">{formatNaira(order.total)}</td>
                    <td className="py-3">
                      <StatusBadge status={order.status} fulfillment={order.fulfillment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
