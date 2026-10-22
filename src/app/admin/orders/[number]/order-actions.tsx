"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import type { Fulfillment, OrderStatus } from "@/lib/orders/status";
import { type OrderActionState, resolveReview, updateOrderStatus } from "../actions";

type NextStep = {
  status: Exclude<OrderStatus, "pending_payment" | "paid">;
  label: string;
  tone?: "danger";
};

function nextSteps(status: OrderStatus, fulfillment: Fulfillment): NextStep[] {
  const ship: NextStep = {
    status: "shipped",
    label: fulfillment === "pickup" ? "Ready for pickup" : "Mark dispatched",
  };
  const deliver: NextStep = {
    status: "delivered",
    label: fulfillment === "pickup" ? "Mark collected" : "Mark delivered",
  };
  const cancel: NextStep = { status: "cancelled", label: "Cancel order", tone: "danger" };
  const refund: NextStep = { status: "refunded", label: "Mark refunded", tone: "danger" };
  switch (status) {
    case "pending_payment":
      return [cancel];
    case "paid":
      return [{ status: "processing", label: "Start preparing" }, ship, cancel, refund];
    case "processing":
      return [ship, cancel, refund];
    case "shipped":
      return [deliver, refund];
    case "delivered":
      return [refund];
    default:
      return [];
  }
}

export function OrderStatusPanel({
  orderId,
  number,
  status,
  fulfillment,
}: {
  orderId: string;
  number: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
}) {
  const steps = nextSteps(status, fulfillment);
  const [chosen, setChosen] = useState<NextStep | null>(null);
  const [state, submit, pending] = useActionState<OrderActionState, FormData>(updateOrderStatus, {
    status: "idle",
  });

  if (steps.length === 0)
    return <p className="text-sm text-muted">No further actions for this order.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <Button
            key={step.status}
            type="button"
            size="sm"
            variant={chosen?.status === step.status ? "primary" : "secondary"}
            className={
              step.tone === "danger" && chosen?.status !== step.status
                ? "border-signal text-signal hover:bg-signal hover:text-paper"
                : undefined
            }
            onClick={() => setChosen(step)}
          >
            {step.label}
          </Button>
        ))}
      </div>

      {chosen && (
        <form action={submit} className="space-y-4 border border-line p-4">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="number" value={number} />
          <input type="hidden" name="status" value={chosen.status} />
          {chosen.status === "shipped" && fulfillment === "delivery" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tracking number (optional)" htmlFor="trackingNumber">
                <Input id="trackingNumber" name="trackingNumber" />
              </Field>
              <Field label="Courier (optional)" htmlFor="carrier">
                <Input id="carrier" name="carrier" placeholder="e.g. GIG Logistics" />
              </Field>
            </div>
          )}
          <Field
            label="Note to customer (optional)"
            htmlFor="message"
            hint="Shown on their order page. Leave blank for the standard message."
          >
            <Textarea id="message" name="message" rows={2} />
          </Field>
          {(chosen.status === "cancelled" || chosen.status === "refunded") && (
            <p className="text-sm text-signal">
              This doesn&apos;t move money. Issue any refund in your Paystack dashboard first.
              {status !== "shipped" && status !== "delivered" && " The items go back into stock."}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : `Confirm: ${chosen.label.toLowerCase()}`}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setChosen(null)}>
              Back
            </Button>
          </div>
        </form>
      )}

      {state.message && (
        <p
          role="status"
          className={state.status === "error" ? "text-sm text-signal" : "text-sm text-muted"}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

export function ResolveReviewForm({ orderId, number }: { orderId: string; number: string }) {
  const [state, submit, pending] = useActionState<OrderActionState, FormData>(resolveReview, {
    status: "idle",
  });
  return (
    <form action={submit} className="mt-4 space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="number" value={number} />
      <Field label="How was it resolved?" htmlFor="note">
        <Textarea id="note" name="note" rows={2} required />
      </Field>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Mark resolved"}
      </Button>
      {state.message && (
        <p
          role="status"
          className={state.status === "error" ? "text-sm text-signal" : "text-sm text-muted"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
