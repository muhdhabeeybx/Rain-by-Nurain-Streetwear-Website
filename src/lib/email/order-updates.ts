import "server-only";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import { getOrderById } from "@/lib/orders/queries";
import { sendEmail } from "./send";

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** Tells the customer their order has left (or is ready to collect). */
export async function sendOrderDispatched(orderId: string) {
  const order = await getOrderById(orderId);
  const link = `${env.NEXT_PUBLIC_SITE_URL}/orders/${order.number}?token=${order.accessToken}`;
  const pickup = order.fulfillment === "pickup";
  const headline = pickup ? "Your order is ready for pickup" : "Your order is on its way";
  const detail = pickup
    ? `Collect it from ${order.pickup?.name ?? "our studio"}${order.pickup ? `, ${order.pickup.address}, ${order.pickup.city}` : ""}. Bring your order number: ${order.number}.`
    : `Order ${order.number} has been dispatched. Our rider will call ${order.phone} before delivery.`;
  const tracking = order.trackingNumber
    ? `Tracking: ${order.trackingNumber}${order.carrier ? ` (${order.carrier})` : ""}`
    : "";

  await sendEmail({
    to: order.email,
    subject: pickup
      ? `Order ${order.number} is ready for pickup`
      : `Order ${order.number} is on its way`,
    text: [headline, "", detail, tracking, "", `View your order: ${link}`]
      .filter((line) => line !== undefined)
      .join("\n"),
    html: `<!doctype html><html lang="en"><body style="margin:0;background:#f4f2ee;color:#121212;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding-bottom:32px;font-size:13px;letter-spacing:3px;text-transform:uppercase">${site.name}</td></tr>
<tr><td style="font-size:28px;font-weight:700;text-transform:uppercase;line-height:1.1;padding-bottom:16px">${headline}</td></tr>
<tr><td style="padding-bottom:16px">${escape(detail)}</td></tr>
${tracking ? `<tr><td style="padding-bottom:16px;font-family:monospace">${escape(tracking)}</td></tr>` : ""}
<tr><td style="padding:16px 0 32px"><a href="${link}" style="display:inline-block;background:#121212;color:#f4f2ee;text-decoration:none;padding:14px 24px;font-size:12px;letter-spacing:2px;text-transform:uppercase">View your order</a></td></tr>
<tr><td style="border-top:1px solid #d9d5cc;padding-top:16px;color:#67635d;font-size:13px">Questions? Write to ${site.email}.</td></tr>
</table></td></tr></table></body></html>`,
  });
}
