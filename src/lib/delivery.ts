import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export const DELIVERY_TAG = "delivery";

export type DeliveryZone = {
  id: string;
  name: string;
  fee: number;
  freeOver: number | null;
  minDays: number;
  maxDays: number;
  states: string[];
};

export type PickupLocation = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  hours: string | null;
  instructions: string | null;
};

export type DeliveryOptions = { zones: DeliveryZone[]; pickupLocations: PickupLocation[] };

/** Active delivery zones and pickup points, as shown at checkout. */
export async function getDeliveryOptions(): Promise<DeliveryOptions> {
  "use cache";
  cacheLife("hours");
  cacheTag(DELIVERY_TAG);

  const supabase = createPublicClient();
  const [zones, pickup] = await Promise.all([
    supabase
      .from("delivery_zones")
      .select("id, name, fee, free_over, min_days, max_days, states:delivery_zone_states(state)")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("pickup_locations")
      .select("id, name, address, city, state, hours, instructions")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  if (zones.error) throw new Error(`Could not load delivery zones: ${zones.error.message}`);
  if (pickup.error) throw new Error(`Could not load pickup locations: ${pickup.error.message}`);

  return {
    zones: zones.data.map((zone) => ({
      id: zone.id,
      name: zone.name,
      fee: zone.fee,
      freeOver: zone.free_over,
      minDays: zone.min_days,
      maxDays: zone.max_days,
      states: zone.states.map(({ state }) => state),
    })),
    pickupLocations: pickup.data,
  };
}
