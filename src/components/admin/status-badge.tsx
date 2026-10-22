import { statusLabel, type Fulfillment, type OrderStatus } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

const TONE: Record<OrderStatus, string> = {
  pending_payment: "border-line-strong text-muted",
  paid: "border-ink bg-ink text-paper",
  processing: "border-ink text-ink",
  shipped: "border-ink text-ink",
  delivered: "border-line-strong text-muted",
  cancelled: "border-line text-muted line-through",
  refunded: "border-line text-muted",
};

/** Admin-facing status; "paid" reads as "To fulfil" because that's the job. */
export function StatusBadge({
  status,
  fulfillment,
}: {
  status: OrderStatus;
  fulfillment: Fulfillment;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center border px-2 type-label whitespace-nowrap",
        TONE[status],
      )}
    >
      {status === "paid" ? "To fulfil" : statusLabel(status, fulfillment)}
    </span>
  );
}
