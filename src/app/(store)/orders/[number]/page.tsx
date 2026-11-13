import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductImage } from "@/components/store/product-image";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { formatNaira } from "@/lib/money";
import { stateLabel } from "@/lib/nigeria";
import { getCustomerOrder, getOrderWithToken, type OrderView } from "@/lib/orders/queries";
import { ORDER_PROGRESS, statusLabel } from "@/lib/orders/status";
import { isPreview } from "@/lib/preview";
import { cn } from "@/lib/utils";
import { ClearBagForOrder, RefreshWhilePending } from "./order-live";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

export default function OrderPage({ params, searchParams }: PageProps<"/orders/[number]">) {
  return (
    <div className="container-page pt-10 pb-24 md:pt-16">
      <Suspense fallback={<OrderSkeleton />}>
        {Promise.all([params, searchParams]).then(([{ number }, { token }]) => (
          <OrderLoader number={number} token={typeof token === "string" ? token : null} />
        ))}
      </Suspense>
    </div>
  );
}

async function OrderLoader({ number, token }: { number: string; token: string | null }) {
  if (isPreview) notFound();
  const order = token ? await getOrderWithToken(number, token) : await getCustomerOrder(number);
  if (!order) notFound();
  return <OrderDetails order={order} />;
}

function headline(order: OrderView) {
  const firstName = order.fullName.split(" ")[0];
  switch (order.status) {
    case "pending_payment":
      return {
        title: "Confirming your payment",
        body: "This usually takes a few seconds. Bank transfers can take a few minutes; this page updates on its own.",
      };
    case "cancelled":
      return {
        title: "This order was cancelled",
        body: "You have not been charged for this order. If you think this is a mistake, get in touch.",
      };
    case "refunded":
      return { title: "This order was refunded", body: "Your payment has been returned to you." };
    default:
      return {
        title: `Thank you, ${firstName}`,
        body:
          order.status === "paid"
            ? `Your order is confirmed. A receipt is on its way to ${order.email}.`
            : `Here is the latest on your order.`,
      };
  }
}

function OrderDetails({ order }: { order: OrderView }) {
  const { title, body } = headline(order);
  const step = ORDER_PROGRESS.indexOf(order.status);

  return (
    <>
      <ClearBagForOrder orderNumber={order.number} />
      {order.status === "pending_payment" && <RefreshWhilePending />}

      <p className="type-label text-muted">
        Order {order.number} · {dateFormat.format(new Date(order.createdAt))}
      </p>
      <h1 className="mt-4 type-display text-display-lg">{title}</h1>
      <p className="mt-4 max-w-xl text-muted" aria-live="polite">
        {body}
      </p>

      {step >= 0 && (
        <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Order progress">
          {ORDER_PROGRESS.map((status, index) => (
            <li key={status} aria-current={index === step ? "step" : undefined}>
              <div className={cn("h-1", index <= step ? "bg-ink" : "bg-line")} />
              <p className={cn("mt-3 type-label", index <= step ? "text-ink" : "text-muted")}>
                {statusLabel(status, order.fulfillment)}
              </p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-14 grid gap-14 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="items-heading">
          <h2 id="items-heading" className="mb-4 type-label">
            Items
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="relative aspect-4/5 w-20 shrink-0 overflow-hidden bg-mist"
                >
                  <ProductImage path={item.imagePath} alt={item.productName} sizes="80px" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p>{item.productName}</p>
                  <p className="text-sm text-muted">
                    {[item.colorName, `Size ${item.size}`, `Qty ${item.quantity}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatNaira(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">
                {order.fulfillment === "pickup" ? "Pickup" : "Delivery"}
              </dt>
              <dd className="tabular-nums">
                {order.deliveryFee ? formatNaira(order.deliveryFee) : "Free"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatNaira(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-10 lg:col-span-4 lg:col-start-9">
          <section aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="mb-4 type-label">
              {order.fulfillment === "pickup" ? "Pickup" : "Delivery"}
            </h2>
            {order.address && (
              <address className="text-sm leading-relaxed not-italic">
                {order.fullName}
                <br />
                {order.address.line1}
                {order.address.line2 && (
                  <>
                    <br />
                    {order.address.line2}
                  </>
                )}
                <br />
                {order.address.city}, {stateLabel(order.address.state)}
                <br />
                {order.phone}
              </address>
            )}
            {order.deliveryNote && (
              <p className="mt-3 border-l-2 border-line-strong pl-3 text-sm text-muted">
                {order.deliveryNote}
              </p>
            )}
            {order.pickup && (
              <div className="text-sm leading-relaxed">
                <p>{order.pickup.name}</p>
                <p className="text-muted">
                  {order.pickup.address}, {order.pickup.city}
                </p>
                {order.pickup.hours && <p className="text-muted">{order.pickup.hours}</p>}
                {order.pickup.instructions && <p className="mt-2">{order.pickup.instructions}</p>}
              </div>
            )}
            {order.trackingNumber && (
              <p className="mt-4 text-sm">
                Tracking: <span className="tabular-nums">{order.trackingNumber}</span>
                {order.carrier && <span className="text-muted"> ({order.carrier})</span>}
              </p>
            )}
          </section>

          {order.events.length > 0 && (
            <section aria-labelledby="updates-heading">
              <h2 id="updates-heading" className="mb-4 type-label">
                Updates
              </h2>
              <ol className="space-y-4 border-l border-line pl-5">
                {order.events.toReversed().map((event) => (
                  <li key={event.id} className="text-sm">
                    <p>{event.message}</p>
                    <p className="text-muted">{dateFormat.format(new Date(event.createdAt))}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="border-t border-line pt-8 text-sm text-muted">
            Questions about your order? Email{" "}
            <a
              href={`mailto:${site.email}?subject=Order ${order.number}`}
              className="text-ink underline underline-offset-4"
            >
              {site.email}
            </a>{" "}
            and include your order number.
          </section>

          <Button asChild variant="secondary" className="w-full">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function OrderSkeleton() {
  return (
    <div aria-hidden className="space-y-4">
      <div className="h-4 w-48 animate-pulse bg-mist" />
      <div className="h-14 w-2/3 animate-pulse bg-mist" />
      <div className="h-5 w-1/2 animate-pulse bg-mist" />
      <div className="mt-14 h-80 animate-pulse bg-mist" />
    </div>
  );
}
