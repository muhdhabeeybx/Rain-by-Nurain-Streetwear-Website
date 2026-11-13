/**
 * Every email the store sends, as pure functions of an order. Rendering never
 * touches the network, so templates are unit tested and previewed in the
 * admin at /admin/emails.
 */
import { site } from "@/config/site";
import { formatNaira } from "@/lib/money";
import { stateLabel } from "@/lib/nigeria";
import type { OrderView } from "@/lib/orders/queries";
import { ORDER_PROGRESS, statusLabel } from "@/lib/orders/status";
import {
  button,
  callout,
  code,
  type EmailContext,
  type EmailLine,
  escape,
  eyebrow,
  headline,
  infoColumns,
  layout,
  lineItems,
  link,
  mono,
  paragraph,
  progress,
  type RenderedEmail,
  sectionTitle,
  spacer,
  strong,
  totals,
} from "./components";

export type { EmailContext, RenderedEmail } from "./components";

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

const STRIP = "Delivery across Nigeria · Secure payment with Paystack";

// -----------------------------------------------------------------------------
// Shared pieces
// -----------------------------------------------------------------------------

const firstName = (order: OrderView) => order.fullName.trim().split(/\s+/)[0];
const isPickup = (order: OrderView) => order.fulfillment === "pickup";

export function orderLink(order: OrderView, ctx: EmailContext) {
  return `${ctx.siteUrl}/orders/${order.number}?token=${order.accessToken}`;
}

export function adminOrderLink(order: OrderView, ctx: EmailContext) {
  return `${ctx.siteUrl}/admin/orders/${order.number}`;
}

function itemMeta(item: OrderView["items"][number]) {
  return [item.colorName, `Size ${item.size}`, `Qty ${item.quantity}`].filter(Boolean).join(" · ");
}

function emailLines(order: OrderView, ctx: EmailContext): EmailLine[] {
  return order.items.map((item) => ({
    name: item.productName,
    meta: itemMeta(item),
    amount: formatNaira(item.lineTotal),
    href: `${ctx.siteUrl}/products/${item.productSlug}`,
    imageUrl: item.imagePath ? ctx.imageUrl(item.imagePath) : null,
  }));
}

function orderTotals(order: OrderView, totalLabel: string) {
  const rows: [string, string][] = [["Subtotal", formatNaira(order.subtotal)]];
  if (order.discountTotal > 0) rows.push(["Discount", `−${formatNaira(order.discountTotal)}`]);
  rows.push([
    isPickup(order) ? "Pickup" : "Delivery",
    order.deliveryFee ? formatNaira(order.deliveryFee) : "Free",
  ]);
  return totals(rows, [totalLabel, formatNaira(order.total)]);
}

/** Address (or pickup point) lines, for both HTML columns and plain text. */
function destinationLines(order: OrderView) {
  if (order.address) {
    return [
      order.fullName,
      order.address.line1,
      order.address.line2 ?? "",
      `${order.address.city}, ${stateLabel(order.address.state)}`,
      order.phone,
    ].filter(Boolean);
  }
  if (order.pickup) {
    return [
      order.pickup.name,
      order.pickup.address,
      order.pickup.city,
      order.pickup.hours ?? "",
    ].filter(Boolean);
  }
  return [];
}

function progressBar(order: OrderView, current: number) {
  return progress(
    ORDER_PROGRESS.map((status) => statusLabel(status, order.fulfillment)),
    current,
  );
}

function helpLine(order: OrderView) {
  return paragraph(
    `Questions? Reply to this email or write to ${link(site.email, `mailto:${site.email}`)}, and include your order number ${mono(order.number)}.`,
    { muted: true, size: 13 },
  );
}

const customerReason = (order: OrderView) =>
  `You're getting this email because you placed order ${order.number} at ${site.name}.`;

/** Plain-text alternative: one block per section, blank lines between. */
function plain(...blocks: (string | string[] | false | null | undefined)[]) {
  return blocks
    .filter((block): block is string | string[] => Boolean(block))
    .map((block) => (Array.isArray(block) ? block.filter(Boolean).join("\n") : block))
    .join("\n\n");
}

function plainItems(order: OrderView) {
  return order.items.map(
    (item) => `${item.productName} (${itemMeta(item)}): ${formatNaira(item.lineTotal)}`,
  );
}

function plainTotals(order: OrderView, totalLabel: string) {
  return [
    `Subtotal: ${formatNaira(order.subtotal)}`,
    order.discountTotal > 0 ? `Discount: −${formatNaira(order.discountTotal)}` : "",
    `${isPickup(order) ? "Pickup" : "Delivery"}: ${order.deliveryFee ? formatNaira(order.deliveryFee) : "Free"}`,
    `${totalLabel}: ${formatNaira(order.total)}`,
  ];
}

const plainFooter = () => [`${site.name} · ${site.tagline}`, `Questions? Write to ${site.email}`];

// -----------------------------------------------------------------------------
// Customer emails
// -----------------------------------------------------------------------------

/** Payment received: the receipt. */
export function orderConfirmedEmail(order: OrderView, ctx: EmailContext): RenderedEmail {
  const pickup = isPickup(order);
  const url = orderLink(order, ctx);
  const next = pickup
    ? "We'll email you again as soon as it's ready to collect."
    : "We'll email you again when it's on its way.";
  const paid = order.paidAt ? dateFormat.format(new Date(order.paidAt)) : null;

  const body = [
    eyebrow(`Payment received · ${order.number}`),
    headline(`Thank you, ${firstName(order)}.`),
    paragraph(
      `Your payment went through and your order is confirmed. ${escape(next)} Your pieces are already being set aside for you.`,
    ),
    spacer(32),
    progressBar(order, 0),
    spacer(40),
    sectionTitle("Your order"),
    lineItems(emailLines(order, ctx)),
    orderTotals(order, "Total paid"),
    spacer(40),
    infoColumns([
      { title: pickup ? "Collect from" : "Delivering to", lines: destinationLines(order) },
      {
        title: "Order details",
        lines: [order.number, paid ? `Paid ${paid}` : "", "Paid with Paystack", order.email],
      },
    ]),
    order.deliveryNote ? callout("Your delivery note", escape(order.deliveryNote)) : "",
    order.deliveryNote ? spacer(28) : spacer(4),
    button("Track your order", url),
    helpLine(order),
  ].join("\n");

  return {
    subject: `Order ${order.number} confirmed`,
    html: layout({
      ctx,
      preheader: `Payment received. ${next}`,
      reference: order.number,
      strip: STRIP,
      body,
      reason: customerReason(order),
    }),
    text: plain(
      `Thank you, ${firstName(order)}.`,
      `Your payment went through and order ${order.number} is confirmed. ${next}`,
      plainItems(order),
      plainTotals(order, "Total paid"),
      [`${pickup ? "Collect from" : "Delivering to"}:`, ...destinationLines(order)],
      `Track your order: ${url}`,
      plainFooter(),
    ),
  };
}

/** Dispatched for delivery, or ready to collect. */
export function orderShippedEmail(order: OrderView, ctx: EmailContext): RenderedEmail {
  const pickup = isPickup(order);
  const url = orderLink(order, ctx);
  const subject = pickup
    ? `Order ${order.number} is ready for pickup`
    : `Order ${order.number} is on its way`;
  const intro = pickup
    ? `Your order is packed and waiting for you. Bring your order number when you come by.`
    : `Your order has left the studio. Our rider will call you on ${order.phone} before delivery, so keep your phone close.`;
  const tracking = order.trackingNumber
    ? `${order.trackingNumber}${order.carrier ? ` (${order.carrier})` : ""}`
    : null;

  const note = staffNote(order, "shipped");
  const pickupDetails = order.pickup
    ? [
        strong(order.pickup.name),
        escape(`${order.pickup.address}, ${order.pickup.city}`),
        order.pickup.hours ? escape(order.pickup.hours) : "",
        order.pickup.instructions
          ? `<span style="color:#a9a49b">${escape(order.pickup.instructions)}</span>`
          : "",
      ]
        .filter(Boolean)
        .join("<br>")
    : "";

  const body = [
    eyebrow(pickup ? `Ready for pickup · ${order.number}` : `On its way · ${order.number}`),
    headline(pickup ? "Ready when you are." : "It's on the way."),
    paragraph(escape(intro)),
    note ? spacer(24) : "",
    note ? callout("A note from us", escape(note)) : "",
    spacer(32),
    progressBar(order, 2),
    spacer(36),
    pickup
      ? callout(
          "Your pickup code",
          `${code(order.number, 28)}<br>${spacer(10)}${pickupDetails}`,
          "inverse",
        )
      : tracking
        ? callout("Tracking", code(tracking, 18))
        : "",
    pickup || tracking ? spacer(36) : "",
    sectionTitle(pickup ? "Ready for you" : "In this delivery"),
    lineItems(emailLines(order, ctx)),
    spacer(32),
    pickup
      ? ""
      : infoColumns([
          { title: "Delivering to", lines: destinationLines(order) },
          { title: "Order", lines: [order.number, order.email] },
        ]),
    button("View your order", url),
    helpLine(order),
  ].join("\n");

  return {
    subject,
    html: layout({
      ctx,
      preheader: pickup
        ? `Bring your order number, ${order.number}, when you collect.`
        : "Our rider will call before delivery.",
      reference: order.number,
      strip: STRIP,
      body,
      reason: customerReason(order),
    }),
    text: plain(
      pickup ? "Your order is ready for pickup." : "Your order is on its way.",
      intro,
      note,
      pickup && order.pickup
        ? [
            `Pickup code: ${order.number}`,
            order.pickup.name,
            `${order.pickup.address}, ${order.pickup.city}`,
            order.pickup.hours ?? "",
            order.pickup.instructions ?? "",
          ]
        : null,
      tracking ? `Tracking: ${tracking}` : null,
      plainItems(order),
      `View your order: ${url}`,
      plainFooter(),
    ),
  };
}

/** Delivered or collected: the thank-you, with the exchange window. */
export function orderDeliveredEmail(order: OrderView, ctx: EmailContext): RenderedEmail {
  const pickup = isPickup(order);
  const url = orderLink(order, ctx);
  const done = pickup ? "collected" : "delivered";
  const note = staffNote(order, "delivered");

  const body = [
    eyebrow(`${pickup ? "Collected" : "Delivered"} · ${order.number}`),
    headline("It's yours."),
    paragraph(
      `Your order was ${done}. We hope it fits like it was made for you, because it was made for people like you: the ones who left home to feed home.`,
    ),
    note ? spacer(24) : "",
    note ? callout("A note from us", escape(note)) : "",
    spacer(32),
    progressBar(order, 3),
    spacer(36),
    callout(
      "Wrong size?",
      `Exchange unworn pieces with their tags on within ${strong(`${site.returnWindowHours} hours`)} of ${pickup ? "collection" : "delivery"}. Reply to this email with your order number and the size you need. ${link("How exchanges work", `${ctx.siteUrl}/returns`)}`,
    ),
    spacer(36),
    sectionTitle("What you got"),
    lineItems(emailLines(order, ctx)),
    spacer(32),
    paragraph(
      `Wearing it? Tag ${link(site.social.instagram.handle, site.social.instagram.url)} on Instagram. We share our favourites.`,
    ),
    spacer(28),
    button("Shop new arrivals", `${ctx.siteUrl}/shop?sort=newest`),
    spacer(12),
    paragraph(link("View your order", url), { size: 13 }),
  ].join("\n");

  return {
    subject: `Order ${order.number} ${done}`,
    html: layout({
      ctx,
      preheader: `Your order was ${done}. Exchanges are open for ${site.returnWindowHours} hours.`,
      reference: order.number,
      strip: STRIP,
      body,
      reason: customerReason(order),
    }),
    text: plain(
      "It's yours.",
      `Order ${order.number} was ${done}.`,
      note,
      `Wrong size? Exchange unworn pieces with tags within ${site.returnWindowHours} hours. Reply to this email with your order number and the size you need. ${ctx.siteUrl}/returns`,
      plainItems(order),
      `Tag ${site.social.instagram.handle} on Instagram.`,
      `View your order: ${url}`,
      plainFooter(),
    ),
  };
}

/** A paid order the team cancelled. */
export function orderCancelledEmail(order: OrderView, ctx: EmailContext): RenderedEmail {
  const url = orderLink(order, ctx);
  const note = staffNote(order, "cancelled");

  const body = [
    eyebrow(`Cancelled · ${order.number}`),
    headline("Order cancelled."),
    paragraph(
      `We've cancelled order ${mono(order.number)}. We're sorry it didn't work out this time.`,
    ),
    note ? spacer(28) : "",
    note ? callout("A note from us", escape(note)) : "",
    spacer(28),
    callout(
      "Your money",
      `Your payment of ${strong(formatNaira(order.total))} is being refunded to the card or account you paid with. Banks usually take 3 to 10 working days to show it.`,
    ),
    spacer(36),
    sectionTitle("Cancelled items"),
    lineItems(emailLines(order, ctx)),
    spacer(32),
    button("View your order", url, "secondary"),
    helpLine(order),
  ].join("\n");

  return {
    subject: `Order ${order.number} cancelled`,
    html: layout({
      ctx,
      preheader: `Your payment of ${formatNaira(order.total)} is being refunded.`,
      reference: order.number,
      body,
      reason: customerReason(order),
    }),
    text: plain(
      "Order cancelled.",
      `We've cancelled order ${order.number}.`,
      note,
      `Your payment of ${formatNaira(order.total)} is being refunded to the card or account you paid with. Banks usually take 3 to 10 working days to show it.`,
      plainItems(order),
      `View your order: ${url}`,
      plainFooter(),
    ),
  };
}

/** The refund has been sent. */
export function orderRefundedEmail(order: OrderView, ctx: EmailContext): RenderedEmail {
  const url = orderLink(order, ctx);
  const note = staffNote(order, "refunded");

  const body = [
    eyebrow(`Refunded · ${order.number}`),
    headline("Refund sent."),
    paragraph(
      `We've refunded your payment for order ${mono(order.number)} to the card or account you paid with.`,
    ),
    spacer(28),
    callout(
      "Amount refunded",
      `${code(formatNaira(order.total), 26)}<br><span style="font-size:13px;color:#67635d">Banks usually take 3 to 10 working days to show it.</span>`,
    ),
    note ? spacer(20) : "",
    note ? callout("A note from us", escape(note)) : "",
    spacer(36),
    sectionTitle("Refunded order"),
    lineItems(emailLines(order, ctx)),
    spacer(32),
    button("Back to the shop", `${ctx.siteUrl}/shop`, "secondary"),
    helpLine(order),
  ].join("\n");

  return {
    subject: `Refund for order ${order.number}`,
    html: layout({
      ctx,
      preheader: `We've refunded ${formatNaira(order.total)} to your original payment method.`,
      reference: order.number,
      body,
      reason: customerReason(order),
    }),
    text: plain(
      "Refund sent.",
      `We've refunded ${formatNaira(order.total)} for order ${order.number} to the card or account you paid with. Banks usually take 3 to 10 working days to show it.`,
      note,
      plainItems(order),
      `View your order: ${url}`,
      plainFooter(),
    ),
  };
}

/** Messages the database writes when the team doesn't add their own. */
const DEFAULT_MESSAGES = new Set([
  "Your order is ready for pickup.",
  "Your order is on its way.",
  "Your order was collected.",
  "Your order was delivered.",
  "Your order was cancelled.",
  "Your payment was refunded.",
]);

/** The team's own note on the latest change to `status`, if they wrote one. */
function staffNote(order: OrderView, status: OrderView["status"]) {
  const event = order.events.findLast((candidate) => candidate.status === status);
  return event && !DEFAULT_MESSAGES.has(event.message) ? event.message : null;
}

// -----------------------------------------------------------------------------
// Store team emails
// -----------------------------------------------------------------------------

const teamReason = `Sent to the ${site.name} team because this address receives order alerts.`;

function customerColumns(order: OrderView) {
  return infoColumns([
    { title: "Customer", lines: [order.fullName, order.email, order.phone] },
    {
      title: isPickup(order) ? "Pickup at" : "Deliver to",
      lines: order.address
        ? [
            order.address.line1,
            order.address.line2 ?? "",
            `${order.address.city}, ${stateLabel(order.address.state)}`,
          ]
        : order.pickup
          ? [order.pickup.name, order.pickup.city]
          : [],
    },
  ]);
}

/** New paid order: what to pack and where it goes. */
export function newOrderAlertEmail(
  order: OrderView,
  ctx: EmailContext,
  review: string | null = null,
): RenderedEmail {
  const url = adminOrderLink(order, ctx);
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const where = order.address ? stateLabel(order.address.state) : "Pickup";

  const body = [
    review ? callout("Needs review before you fulfil", escape(review), "warning") : "",
    review ? spacer(32) : "",
    eyebrow(`New order · ${order.number}`),
    headline(formatNaira(order.total)),
    paragraph(
      `${escape(order.fullName)} just paid for ${units} ${units === 1 ? "piece" : "pieces"}${order.address ? `, delivering to ${escape(where)}` : ", collecting in person"}.${order.paidAt ? ` Paid ${escape(dateFormat.format(new Date(order.paidAt)))}.` : ""}`,
    ),
    spacer(36),
    sectionTitle("To pack"),
    lineItems(emailLines(order, ctx)),
    orderTotals(order, "Total paid"),
    spacer(36),
    customerColumns(order),
    order.deliveryNote ? callout("Customer's note", escape(order.deliveryNote)) : "",
    order.deliveryNote ? spacer(28) : spacer(4),
    button("Open in admin", url),
    paragraph(
      `When it ${isPickup(order) ? "is packed, mark it ready for pickup" : "leaves the studio, mark it dispatched"} in the admin. The customer is emailed automatically.`,
      { muted: true, size: 13 },
    ),
  ].join("\n");

  return {
    subject: `${review ? "[Review] " : ""}New order ${order.number} · ${formatNaira(order.total)} · ${where}`,
    html: layout({
      ctx,
      preheader: `${order.fullName} · ${units} ${units === 1 ? "piece" : "pieces"} · ${where}`,
      reference: order.number,
      strip: review ? "Order alert · Needs review" : "Order alert · Paid",
      body,
      reason: teamReason,
      audience: "team",
    }),
    text: plain(
      review ? `NEEDS REVIEW: ${review}` : null,
      `New order ${order.number}: ${formatNaira(order.total)}`,
      plainItems(order),
      plainTotals(order, "Total paid"),
      [`Customer: ${order.fullName}`, order.email, order.phone],
      [`${isPickup(order) ? "Pickup at" : "Deliver to"}:`, ...destinationLines(order)],
      order.deliveryNote ? `Note: ${order.deliveryNote}` : null,
      `Open in admin: ${url}`,
    ),
  };
}

/** A payment arrived that doesn't match its order. Nothing was marked paid. */
export function paymentReviewAlertEmail(
  order: OrderView,
  ctx: EmailContext,
  reason: string,
): RenderedEmail {
  const url = adminOrderLink(order, ctx);

  const body = [
    eyebrow(`Needs review · ${order.number}`, "#b3261e"),
    headline("Check this payment."),
    paragraph(
      `Paystack reported a payment for order ${mono(order.number)} that doesn't match it, so the order was ${strong("not")} marked as paid. Check the transaction in your Paystack dashboard, then refund it or contact the customer.`,
    ),
    spacer(28),
    callout("What happened", escape(reason), "warning"),
    spacer(36),
    customerColumns(order),
    button("Open in admin", url),
  ].join("\n");

  return {
    subject: `[Review] Payment for order ${order.number} needs checking`,
    html: layout({
      ctx,
      preheader: "A payment didn't match its order. Don't fulfil until it's resolved.",
      reference: order.number,
      strip: "Order alert · Needs review",
      body,
      reason: teamReason,
      audience: "team",
    }),
    text: plain(
      `Payment for order ${order.number} needs checking. It was not marked as paid.`,
      reason,
      [`Customer: ${order.fullName}`, order.email, order.phone],
      `Open in admin: ${url}`,
    ),
  };
}

// -----------------------------------------------------------------------------
// Sign-in code (sent by Supabase Auth, not by this app)
// -----------------------------------------------------------------------------

/**
 * The sign-in code email, rendered with Supabase's template variables. Saved
 * to supabase/templates/sign-in-code.html; paste it into the Supabase
 * dashboard for both the "Magic link" and "Confirm signup" templates.
 */
export function signInCodeEmail(ctx: EmailContext, token = "{{ .Token }}"): RenderedEmail {
  const body = [
    eyebrow("Sign in"),
    headline("Your code."),
    paragraph(`Enter this code on ${escape(site.name)} to sign in. It expires in one hour.`),
    spacer(28),
    callout("Sign-in code", code(token, 34), "inverse"),
    spacer(28),
    paragraph(
      "No password needed. Once you're in, you can track orders and check out faster. Didn't ask for this? Ignore this email and nothing will change.",
      { muted: true, size: 13 },
    ),
  ].join("\n");

  return {
    subject: `Your ${site.name} sign-in code`,
    html: layout({
      ctx,
      preheader: "Your sign-in code is inside. It expires in one hour.",
      body,
      reason: `You're getting this because someone entered this email address to sign in to ${site.name}.`,
    }),
    text: plain(`Your ${site.name} sign-in code: ${token}`, "It expires in one hour."),
  };
}
