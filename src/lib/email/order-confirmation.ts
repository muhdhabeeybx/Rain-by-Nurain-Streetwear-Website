import "server-only";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import { formatNaira } from "@/lib/money";
import { stateLabel } from "@/lib/nigeria";
import { getOrderById, type OrderView } from "@/lib/orders/queries";
import { sendEmail } from "./send";

export async function sendOrderConfirmation(orderId: string) {
  const order = await getOrderById(orderId);
  await sendEmail({
    to: order.email,
    subject: `Order ${order.number} confirmed`,
    ...renderOrderConfirmation(order),
  });
}

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export function renderOrderConfirmation(order: OrderView) {
  const link = `${env.NEXT_PUBLIC_SITE_URL}/orders/${order.number}?token=${order.accessToken}`;
  const firstName = order.fullName.split(" ")[0];
  const destination = order.address
    ? [
        order.address.line1,
        order.address.line2,
        order.address.city,
        stateLabel(order.address.state),
      ]
        .filter(Boolean)
        .join(", ")
    : order.pickup
      ? `Pickup from ${order.pickup.name}, ${order.pickup.address}, ${order.pickup.city}`
      : "";

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #d9d5cc">
            ${escape(item.productName)}<br>
            <span style="color:#67635d;font-size:13px">${escape(
              [item.colorName, `Size ${item.size}`, `Qty ${item.quantity}`]
                .filter(Boolean)
                .join(" · "),
            )}</span>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #d9d5cc;font-family:monospace">
            ${formatNaira(item.lineTotal)}
          </td>
        </tr>`,
    )
    .join("");

  const totals = [
    ["Subtotal", formatNaira(order.subtotal)],
    [
      order.fulfillment === "pickup" ? "Pickup" : "Delivery",
      order.deliveryFee ? formatNaira(order.deliveryFee) : "Free",
    ],
    ["Total paid", formatNaira(order.total)],
  ]
    .map(
      ([label, value], index, all) => `
        <tr>
          <td style="padding:6px 0;${index === all.length - 1 ? "font-weight:600" : "color:#67635d"}">${label}</td>
          <td align="right" style="padding:6px 0;font-family:monospace;${index === all.length - 1 ? "font-weight:600" : ""}">${value}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f2ee;color:#121212;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee">
      <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
          <tr><td style="padding-bottom:32px;font-size:13px;letter-spacing:3px;text-transform:uppercase">${site.name}</td></tr>
          <tr><td style="font-size:28px;font-weight:700;text-transform:uppercase;line-height:1.1;padding-bottom:16px">Thank you, ${escape(firstName)}.</td></tr>
          <tr><td style="padding-bottom:24px">Your payment went through and order <strong>${order.number}</strong> is confirmed. We'll email you again when it ${order.fulfillment === "pickup" ? "is ready for pickup" : "is on its way"}.</td></tr>
          <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
          <tr><td style="padding-top:12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${totals}</table></td></tr>
          <tr><td style="padding-top:24px;color:#67635d;font-size:13px">${order.fulfillment === "pickup" ? "Collect from" : "Delivering to"}: ${escape(destination)}</td></tr>
          <tr><td style="padding:32px 0">
            <a href="${link}" style="display:inline-block;background:#121212;color:#f4f2ee;text-decoration:none;padding:14px 24px;font-size:12px;letter-spacing:2px;text-transform:uppercase">View your order</a>
          </td></tr>
          <tr><td style="border-top:1px solid #d9d5cc;padding-top:16px;color:#67635d;font-size:13px">
            Questions? Reply to this email or write to ${site.email}.<br>${site.tagline}.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    `Thank you, ${firstName}.`,
    `Your payment went through and order ${order.number} is confirmed.`,
    "",
    ...order.items.map(
      (item) =>
        `${item.productName} (${[item.colorName, `size ${item.size}`].filter(Boolean).join(", ")}) x${item.quantity}: ${formatNaira(item.lineTotal)}`,
    ),
    "",
    `Subtotal: ${formatNaira(order.subtotal)}`,
    `${order.fulfillment === "pickup" ? "Pickup" : "Delivery"}: ${order.deliveryFee ? formatNaira(order.deliveryFee) : "Free"}`,
    `Total paid: ${formatNaira(order.total)}`,
    "",
    `${order.fulfillment === "pickup" ? "Collect from" : "Delivering to"}: ${destination}`,
    "",
    `View your order: ${link}`,
    "",
    `Questions? Write to ${site.email}.`,
  ].join("\n");

  return { html, text };
}
