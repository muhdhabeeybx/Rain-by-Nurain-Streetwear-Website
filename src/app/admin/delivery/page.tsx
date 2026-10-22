import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { nairaInputValue } from "@/lib/money";
import { PickupForm, ZoneForm, ZoneStatesForm } from "./settings-forms";

export const metadata: Metadata = { title: "Delivery" };

export default function AdminDeliveryPage() {
  return (
    <>
      <h1 className="type-display text-display-md">Delivery</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Changes apply to new checkouts straight away and update the shipping page.
      </p>
      <Suspense fallback={<div aria-hidden className="mt-8 h-96 animate-pulse bg-mist" />}>
        <DeliverySettings />
      </Suspense>
    </>
  );
}

async function DeliverySettings() {
  const { supabase } = await requireAdmin();
  const [zones, states, pickup] = await Promise.all([
    supabase.from("delivery_zones").select("*").order("sort_order").order("name"),
    supabase.from("delivery_zone_states").select("state, zone_id"),
    supabase.from("pickup_locations").select("*").order("sort_order").order("name"),
  ]);
  for (const result of [zones, states, pickup]) {
    if (result.error) throw new Error(`Could not load delivery settings: ${result.error.message}`);
  }

  return (
    <div className="mt-10 space-y-16">
      <section aria-labelledby="zones-heading">
        <h2 id="zones-heading" className="mb-4 type-label">
          Zones &amp; fees
        </h2>
        <div className="space-y-3">
          {zones.data?.map((zone) => (
            <ZoneForm
              key={zone.id}
              zone={{
                id: zone.id,
                name: zone.name,
                fee: nairaInputValue(zone.fee),
                freeOver: nairaInputValue(zone.free_over),
                minDays: zone.min_days,
                maxDays: zone.max_days,
                isActive: zone.is_active,
              }}
            />
          ))}
          <details className="group">
            <summary className="cursor-pointer py-3 type-label text-muted hover:text-ink">
              + Add a zone
            </summary>
            <ZoneForm
              zone={{ name: "", fee: "", freeOver: "", minDays: 1, maxDays: 3, isActive: true }}
            />
          </details>
        </div>
      </section>

      <section aria-labelledby="states-heading">
        <h2 id="states-heading" className="mb-2 type-label">
          Which zone each state is in
        </h2>
        <p className="mb-6 text-sm text-muted">
          Customers can&apos;t choose delivery to a state with no zone.
        </p>
        <ZoneStatesForm
          zones={(zones.data ?? []).map(({ id, name }) => ({ id, name }))}
          assignments={Object.fromEntries(
            (states.data ?? []).map(({ state, zone_id }) => [state, zone_id]),
          )}
        />
      </section>

      <section aria-labelledby="pickup-heading">
        <h2 id="pickup-heading" className="mb-2 type-label">
          Pickup locations
        </h2>
        <p className="mb-6 text-sm text-muted">
          When at least one is active, customers can choose free pickup at checkout.
        </p>
        <div className="space-y-3">
          {pickup.data?.map((location) => (
            <PickupForm
              key={location.id}
              location={{
                id: location.id,
                name: location.name,
                address: location.address,
                city: location.city,
                state: location.state,
                hours: location.hours ?? "",
                instructions: location.instructions ?? "",
                isActive: location.is_active,
              }}
            />
          ))}
          <details>
            <summary className="cursor-pointer py-3 type-label text-muted hover:text-ink">
              + Add a pickup location
            </summary>
            <PickupForm
              location={{
                name: "",
                address: "",
                city: "",
                state: "FCT",
                hours: "",
                instructions: "",
                isActive: true,
              }}
            />
          </details>
        </div>
      </section>
    </div>
  );
}
