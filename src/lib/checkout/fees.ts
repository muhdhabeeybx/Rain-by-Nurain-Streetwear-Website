import type { DeliveryZone } from "@/lib/delivery";

/**
 * Mirrors the delivery fee rule in `create_order` so checkout can show the fee
 * before submitting. The database recomputes it when the order is placed.
 */
export function deliveryFeeFor(zone: DeliveryZone, subtotal: number) {
  return zone.freeOver !== null && subtotal >= zone.freeOver ? 0 : zone.fee;
}

export function zoneForState(zones: DeliveryZone[], state: string) {
  return zones.find((zone) => zone.states.includes(state)) ?? null;
}

/** The cheapest fee and the overall delivery window across active zones. */
export function deliveryRange(zones: DeliveryZone[]) {
  if (zones.length === 0) return null;
  const thresholds = zones.flatMap((zone) => (zone.freeOver === null ? [] : [zone.freeOver]));
  return {
    fromFee: Math.min(...zones.map((zone) => zone.fee)),
    minDays: Math.min(...zones.map((zone) => zone.minDays)),
    maxDays: Math.max(...zones.map((zone) => zone.maxDays)),
    /** Lowest order subtotal that ships free somewhere, if any zone offers it. */
    freeOver: thresholds.length > 0 ? Math.min(...thresholds) : null,
  };
}

export function deliveryEstimate(zone: Pick<DeliveryZone, "minDays" | "maxDays">) {
  const unit = zone.maxDays === 1 ? "business day" : "business days";
  return zone.minDays === zone.maxDays
    ? `${zone.maxDays} ${unit}`
    : `${zone.minDays}–${zone.maxDays} ${unit}`;
}
