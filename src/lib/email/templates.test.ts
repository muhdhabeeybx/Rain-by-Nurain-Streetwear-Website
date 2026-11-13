import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { EMAIL_PREVIEWS } from "./previews";
import { sampleAt, sampleDeliveryOrder, samplePickupOrder } from "./samples";
import {
  newOrderAlertEmail,
  orderCancelledEmail,
  orderConfirmedEmail,
  orderShippedEmail,
  signInCodeEmail,
} from "./templates";

const ctx = {
  siteUrl: "https://rbn.test",
  imageUrl: (path: string) => `https://cdn.test/${path}`,
};

describe("order emails", () => {
  it("links the customer to their private order page", () => {
    const email = orderConfirmedEmail(sampleDeliveryOrder, ctx);
    const link = `https://rbn.test/orders/RBN-1042?token=${sampleDeliveryOrder.accessToken}`;

    expect(email.subject).toBe("Order RBN-1042 confirmed");
    expect(email.html).toContain(link);
    expect(email.text).toContain(link);
  });

  it("shows every item, the totals and the delivery address", () => {
    const { html, text } = orderConfirmedEmail(sampleDeliveryOrder, ctx);

    for (const content of [html, text]) {
      expect(content).toContain("Left Home Hoodie");
      expect(content).toContain("Size M");
      expect(content).toContain("₦69,500");
      expect(content).toContain("₦3,500");
      expect(content).toContain("14 Aminu Kano Crescent");
    }
    expect(html).toContain("https://cdn.test/sample/hoodie.jpg");
  });

  it("escapes everything a customer typed", () => {
    const order = {
      ...sampleDeliveryOrder,
      fullName: `<script>alert(1)</script> Doe`,
      deliveryNote: `"><img src=x onerror=alert(1)>`,
      address: { ...sampleDeliveryOrder.address!, line1: "<b>1 Road</b>" },
    };

    const { html } = orderConfirmedEmail(order, ctx);
    const alert = newOrderAlertEmail(order, ctx).html;

    for (const content of [html, alert]) {
      expect(content).not.toContain("<script>");
      expect(content).not.toContain("<img src=x");
      expect(content).not.toContain("<b>1 Road</b>");
    }
  });

  it("gives pickup orders the pickup point and code, not a rider", () => {
    const { subject, html, text } = orderShippedEmail(sampleAt(samplePickupOrder, "shipped"), ctx);

    expect(subject).toBe("Order RBN-1043 is ready for pickup");
    expect(html).toContain("RBN Studio");
    expect(text).toContain("Pickup code: RBN-1043");
    expect(html).not.toContain("rider");
  });

  it("includes tracking for dispatched deliveries", () => {
    const { html } = orderShippedEmail(sampleAt(sampleDeliveryOrder, "shipped"), ctx);
    expect(html).toContain("GIG-88213409");
    expect(html).toContain("GIG Logistics");
  });

  it("shows the team's own note, but not the standard message", () => {
    const withNote = {
      ...sampleAt(sampleDeliveryOrder, "cancelled"),
      events: [
        {
          id: 1,
          status: "cancelled" as const,
          message: "The hoodie was damaged in our studio.",
          createdAt: "2026-11-13T10:00:00.000Z",
        },
      ],
    };
    const standard = {
      ...withNote,
      events: [{ ...withNote.events[0], message: "Your order was cancelled." }],
    };

    expect(orderCancelledEmail(withNote, ctx).html).toContain("damaged in our studio");
    expect(orderCancelledEmail(standard, ctx).html).not.toContain("A note from us");
  });

  it("puts review warnings at the top of the team alert", () => {
    const flagged = newOrderAlertEmail(sampleDeliveryOrder, ctx, "Late payment; stock sold out.");
    const clean = newOrderAlertEmail(sampleDeliveryOrder, ctx);

    expect(flagged.subject).toMatch(/^\[Review\] New order RBN-1042/);
    expect(flagged.html).toContain("Late payment; stock sold out.");
    expect(clean.subject).toBe("New order RBN-1042 · ₦69,500 · Abuja (FCT)");
    expect(clean.html).toContain("https://rbn.test/admin/orders/RBN-1042");
  });

  it("renders every preview", () => {
    for (const preview of EMAIL_PREVIEWS) {
      const email = preview.render(ctx);
      expect(email.subject, preview.key).not.toBe("");
      expect(email.html, preview.key).toMatch(/^<!doctype html>/);
      expect(email.html, preview.key).toContain(`${ctx.siteUrl}/email/rbn-monogram.png`);
      expect(email.text, preview.key).not.toContain("undefined");
      expect(email.html, preview.key).not.toContain("undefined");
    }
  });
});

describe("Supabase sign-in template", () => {
  const PATH = "supabase/templates/sign-in-code.html";

  it("is up to date with the email design", () => {
    const { html } = signInCodeEmail({ siteUrl: "{{ .SiteURL }}", imageUrl: (path) => path });
    expect(html).toContain("{{ .Token }}");
    expect(html).toContain(site.name);

    // UPDATE_EMAIL_TEMPLATES=1 npm test -- templates  rewrites the file.
    if (process.env.UPDATE_EMAIL_TEMPLATES) writeFileSync(PATH, html);
    expect(readFileSync(PATH, "utf8"), `Run: UPDATE_EMAIL_TEMPLATES=1 npm test -- templates`).toBe(
      html,
    );
  });
});
