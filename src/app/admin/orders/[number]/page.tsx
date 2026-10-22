import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { ProductImage } from "@/components/store/product-image";
import { requireAdmin } from "@/lib/admin/auth";
import { formatNaira } from "@/lib/money";
import { stateLabel } from "@/lib/nigeria";
import { OrderStatusPanel, ResolveReviewForm } from "./order-actions";

export const metadata: Metadata = { title: "Order" };

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[number]">) {
  return (
    <Suspense fallback={<div aria-hidden className="h-96 animate-pulse bg-mist" />}>
      {params.then(({ number }) => (
        <OrderDetail number={number} />
      ))}
    </Suspense>
  );
}

async function OrderDetail({ number }: { number: string }) {
  const { supabase } = await requireAdmin();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `*, pickup:pickup_locations(name, address, city),
       items:order_items(id, product_id, product_name, product_slug, color_name, size, image_path, unit_price, quantity, line_total),
       events:order_events(id, status, message, is_internal, created_at)`,
    )
    .eq("number", number)
    .maybeSingle();

  if (error) throw new Error(`Could not load order ${number}: ${error.message}`);
  if (!order) notFound();

  const events = order.events.toSorted(
    (a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id,
  );

  return (
    <>
      <Link href="/admin/orders" className="type-label text-muted hover:text-ink">
        ← Orders
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="type-display font-mono text-display-md">{order.number}</h1>
        <StatusBadge status={order.status} fulfillment={order.fulfillment} />
      </div>
      <p className="mt-2 text-sm text-muted">
        Placed {dateFormat.format(new Date(order.created_at))}
        {order.paid_at && ` · Paid ${dateFormat.format(new Date(order.paid_at))}`}
      </p>

      {order.needs_review && (
        <section className="mt-8 border border-signal p-5">
          <h2 className="type-label text-signal">Needs review</h2>
          <p className="mt-2 text-sm">{order.review_reason}</p>
          <ResolveReviewForm orderId={order.id} number={order.number} />
        </section>
      )}

      <div className="mt-10 grid gap-12 xl:grid-cols-12">
        <div className="space-y-12 xl:col-span-7">
          <section aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="mb-4 type-label">
              Next step
            </h2>
            <OrderStatusPanel
              orderId={order.id}
              number={order.number}
              status={order.status}
              fulfillment={order.fulfillment}
            />
          </section>

          <section aria-labelledby="items-heading">
            <h2 id="items-heading" className="mb-4 type-label">
              Items
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 text-sm">
                  <div className="relative aspect-4/5 w-14 shrink-0 overflow-hidden bg-mist">
                    <ProductImage path={item.image_path} alt={item.product_name} sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${item.product_id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-muted">
                      {[item.color_name, `Size ${item.size}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <p className="font-mono">
                    {item.quantity} × {formatNaira(item.unit_price)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 text-sm">
              {[
                ["Subtotal", order.subtotal],
                [order.fulfillment === "pickup" ? "Pickup" : "Delivery", order.delivery_fee],
                ["Total", order.total],
              ].map(([label, amount]) => (
                <div key={label} className="flex justify-between">
                  <dt className={label === "Total" ? "" : "text-muted"}>{label}</dt>
                  <dd className="font-mono">{formatNaira(Number(amount))}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-10 xl:col-span-4 xl:col-start-9">
          <section aria-labelledby="customer-heading" className="text-sm leading-relaxed">
            <h2 id="customer-heading" className="mb-3 type-label">
              Customer
            </h2>
            <p>{order.full_name}</p>
            <p>
              <a
                href={`mailto:${order.email}?subject=Your order ${order.number}`}
                className="underline underline-offset-4"
              >
                {order.email}
              </a>
            </p>
            <p>
              <a href={`tel:${order.phone}`} className="underline underline-offset-4">
                {order.phone}
              </a>
            </p>
          </section>

          <section aria-labelledby="fulfil-heading" className="text-sm leading-relaxed">
            <h2 id="fulfil-heading" className="mb-3 type-label">
              {order.fulfillment === "pickup" ? "Pickup" : "Deliver to"}
            </h2>
            {order.fulfillment === "delivery" ? (
              <address className="not-italic">
                {order.address_line1}
                {order.address_line2 && (
                  <>
                    <br />
                    {order.address_line2}
                  </>
                )}
                <br />
                {order.city}, {order.state ? stateLabel(order.state) : ""}
              </address>
            ) : (
              <p>
                {order.pickup?.name}, {order.pickup?.city}
              </p>
            )}
            {order.delivery_note && (
              <p className="mt-3 border-l-2 border-ink pl-3">{order.delivery_note}</p>
            )}
            {order.tracking_number && (
              <p className="mt-3">
                Tracking <span className="font-mono">{order.tracking_number}</span>
                {order.carrier && ` (${order.carrier})`}
              </p>
            )}
          </section>

          <section aria-labelledby="payment-heading" className="text-sm leading-relaxed">
            <h2 id="payment-heading" className="mb-3 type-label">
              Payment
            </h2>
            <p className="font-mono break-all text-muted">{order.payment_reference}</p>
            <p className="text-muted">Look this reference up in your Paystack dashboard.</p>
          </section>

          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="mb-3 type-label">
              History
            </h2>
            <ol className="space-y-4 border-l border-line pl-4 text-sm">
              {events.map((event) => (
                <li key={event.id}>
                  <p>
                    {event.is_internal && (
                      <span className="mr-2 type-label text-signal">Internal</span>
                    )}
                    {event.message}
                  </p>
                  <p className="text-muted">{dateFormat.format(new Date(event.created_at))}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
