/**
 * Every email, rendered with sample orders, for the admin preview page.
 */
import { SAMPLE_REVIEW_REASON, sampleAt, sampleDeliveryOrder, samplePickupOrder } from "./samples";
import {
  type EmailContext,
  newOrderAlertEmail,
  orderCancelledEmail,
  orderConfirmedEmail,
  orderDeliveredEmail,
  orderRefundedEmail,
  orderShippedEmail,
  paymentReviewAlertEmail,
  type RenderedEmail,
  signInCodeEmail,
} from "./templates";

export type EmailPreview = {
  key: string;
  label: string;
  audience: "Customer" | "Team";
  when: string;
  render: (ctx: EmailContext) => RenderedEmail;
};

const delivery = sampleDeliveryOrder;
const pickup = samplePickupOrder;

export const EMAIL_PREVIEWS: EmailPreview[] = [
  {
    key: "confirmed",
    label: "Order confirmed",
    audience: "Customer",
    when: "Payment succeeds",
    render: (ctx) => orderConfirmedEmail(delivery, ctx),
  },
  {
    key: "shipped",
    label: "On its way",
    audience: "Customer",
    when: "You mark a delivery order dispatched",
    render: (ctx) => orderShippedEmail(sampleAt(delivery, "shipped"), ctx),
  },
  {
    key: "ready",
    label: "Ready for pickup",
    audience: "Customer",
    when: "You mark a pickup order ready",
    render: (ctx) => orderShippedEmail(sampleAt(pickup, "shipped"), ctx),
  },
  {
    key: "delivered",
    label: "Delivered",
    audience: "Customer",
    when: "You mark an order delivered or collected",
    render: (ctx) => orderDeliveredEmail(sampleAt(delivery, "delivered"), ctx),
  },
  {
    key: "cancelled",
    label: "Cancelled",
    audience: "Customer",
    when: "You cancel a paid order",
    render: (ctx) => orderCancelledEmail(sampleAt(delivery, "cancelled"), ctx),
  },
  {
    key: "refunded",
    label: "Refunded",
    audience: "Customer",
    when: "You mark an order refunded",
    render: (ctx) => orderRefundedEmail(sampleAt(delivery, "refunded"), ctx),
  },
  {
    key: "sign-in",
    label: "Sign-in code",
    audience: "Customer",
    when: "Someone signs in (sent by Supabase)",
    render: (ctx) => signInCodeEmail(ctx, "482913"),
  },
  {
    key: "new-order",
    label: "New order",
    audience: "Team",
    when: "Payment succeeds",
    render: (ctx) => newOrderAlertEmail(delivery, ctx),
  },
  {
    key: "payment-review",
    label: "Payment needs review",
    audience: "Team",
    when: "A payment doesn't match its order",
    render: (ctx) =>
      paymentReviewAlertEmail(sampleAt(delivery, "pending_payment"), ctx, SAMPLE_REVIEW_REASON),
  },
];
