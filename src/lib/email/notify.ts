import "server-only";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import { absoluteProductImageUrl } from "@/lib/images";
import { getOrderById, getOrderReview } from "@/lib/orders/queries";
import type { OrderStatus } from "@/lib/orders/status";
import { sendEmail } from "./send";
import {
  type EmailContext,
  newOrderAlertEmail,
  orderCancelledEmail,
  orderConfirmedEmail,
  orderDeliveredEmail,
  orderRefundedEmail,
  orderShippedEmail,
  paymentReviewAlertEmail,
} from "./templates";

/**
 * Who gets which email, and when. Called from `after()`, so failures are
 * logged rather than thrown: an email problem never undoes a payment or an
 * admin action.
 */

export function emailContext(): EmailContext {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  return {
    siteUrl,
    // A small rendition through the site's image optimiser, not the original upload.
    imageUrl: (path) =>
      `${siteUrl}/_next/image?url=${encodeURIComponent(absoluteProductImageUrl(path))}&w=256&q=75`,
  };
}

/** Addresses for store-team alerts: ORDER_ALERT_EMAIL (comma separated), else the shop inbox. */
function teamAddresses() {
  const configured = serverEnv().ORDER_ALERT_EMAIL;
  const list = (configured ?? site.email)
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  return list.length > 0 ? list : [site.email];
}

async function safely(label: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    console.error(`[email] ${label} failed`, error);
  }
}

/** Payment confirmed: the customer's receipt and the team's new-order alert. */
export function notifyOrderPaid(orderId: string) {
  return safely(`order paid ${orderId}`, async () => {
    const [order, review] = await Promise.all([getOrderById(orderId), getOrderReview(orderId)]);
    const ctx = emailContext();

    await Promise.all([
      sendEmail({
        to: order.email,
        replyTo: site.email,
        idempotencyKey: `order-paid/${order.id}`,
        ...orderConfirmedEmail(order, ctx),
      }),
      sendEmail({
        to: teamAddresses(),
        replyTo: order.email,
        idempotencyKey: `team-new-order/${order.id}`,
        ...newOrderAlertEmail(order, ctx, review),
      }),
    ]);
  });
}

/** A payment didn't match its order and was flagged instead of accepted. */
export function notifyPaymentFlagged(orderId: string) {
  return safely(`payment flagged ${orderId}`, async () => {
    const [order, review] = await Promise.all([getOrderById(orderId), getOrderReview(orderId)]);
    if (!review) return;
    await sendEmail({
      to: teamAddresses(),
      replyTo: order.email,
      ...paymentReviewAlertEmail(order, emailContext(), review),
    });
  });
}

const STATUS_EMAILS = {
  shipped: orderShippedEmail,
  delivered: orderDeliveredEmail,
  cancelled: orderCancelledEmail,
  refunded: orderRefundedEmail,
} as const;

/**
 * Tells the customer about a change the team made. Orders that were never paid
 * get nothing: a customer who abandoned checkout doesn't need a cancellation.
 */
export function notifyStatusChange(orderId: string, status: OrderStatus) {
  if (!(status in STATUS_EMAILS)) return Promise.resolve();
  const render = STATUS_EMAILS[status as keyof typeof STATUS_EMAILS];

  return safely(`${status} ${orderId}`, async () => {
    const order = await getOrderById(orderId);
    if (!order.paidAt) return;
    await sendEmail({
      to: order.email,
      replyTo: site.email,
      idempotencyKey: `order-${status}/${order.id}`,
      ...render(order, emailContext()),
    });
  });
}
