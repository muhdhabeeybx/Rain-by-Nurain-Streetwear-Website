"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { useFormAction } from "@/lib/use-form-action";
import { type SettingsState, savePickupLocation, saveZone, saveZoneStates } from "./actions";

function Status({ state }: { state: SettingsState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={state.status === "error" ? "text-sm text-signal" : "text-sm text-muted"}
    >
      {state.message}
    </p>
  );
}

export type ZoneValues = {
  id?: string;
  name: string;
  fee: string;
  freeOver: string;
  minDays: number;
  maxDays: number;
  isActive: boolean;
};

export function ZoneForm({ zone }: { zone: ZoneValues }) {
  const [state, onSubmit, pending] = useFormAction<SettingsState>(saveZone, { status: "idle" });
  const id = zone.id ?? "new";
  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 border border-line p-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-end"
    >
      {zone.id && <input type="hidden" name="id" value={zone.id} />}
      <Field label="Zone" htmlFor={`name-${id}`} className="sm:col-span-2 xl:col-span-2">
        <Input id={`name-${id}`} name="name" defaultValue={zone.name} required />
      </Field>
      <Field label="Fee (₦)" htmlFor={`fee-${id}`}>
        <Input
          id={`fee-${id}`}
          name="fee"
          inputMode="decimal"
          defaultValue={zone.fee}
          className="tabular-nums"
          required
        />
      </Field>
      <Field label="Free over (₦)" htmlFor={`freeOver-${id}`}>
        <Input
          id={`freeOver-${id}`}
          name="freeOver"
          inputMode="decimal"
          defaultValue={zone.freeOver}
          placeholder="Never"
          className="tabular-nums"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Min days" htmlFor={`minDays-${id}`}>
          <Input
            id={`minDays-${id}`}
            name="minDays"
            type="number"
            min={0}
            defaultValue={zone.minDays}
            className="tabular-nums"
          />
        </Field>
        <Field label="Max days" htmlFor={`maxDays-${id}`}>
          <Input
            id={`maxDays-${id}`}
            name="maxDays"
            type="number"
            min={0}
            defaultValue={zone.maxDays}
            className="tabular-nums"
          />
        </Field>
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={zone.isActive}
            className="size-4 accent-ink"
          />
          Delivering
        </label>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : zone.id ? "Save" : "Add zone"}
        </Button>
      </div>
      <div className="sm:col-span-2 xl:col-span-6">
        <Status state={state} />
      </div>
    </form>
  );
}

export function ZoneStatesForm({
  zones,
  assignments,
}: {
  zones: { id: string; name: string }[];
  assignments: Record<string, string>;
}) {
  const [state, onSubmit, pending] = useFormAction<SettingsState>(saveZoneStates, {
    status: "idle",
  });
  return (
    <form onSubmit={onSubmit}>
      <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
        {NIGERIAN_STATES.map((option) => (
          <li
            key={option.value}
            className="flex items-center justify-between gap-3 border-b border-line py-2"
          >
            <label htmlFor={`state-${option.value}`} className="text-sm">
              {option.label}
            </label>
            <select
              id={`state-${option.value}`}
              name={`state:${option.value}`}
              defaultValue={assignments[option.value] ?? ""}
              className="h-9 max-w-48 border border-line-strong bg-transparent px-2 text-sm"
            >
              <option value="">No delivery</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-4">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save states"}
        </Button>
        <Status state={state} />
      </div>
    </form>
  );
}

export type PickupValues = {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  hours: string;
  instructions: string;
  isActive: boolean;
};

export function PickupForm({ location }: { location: PickupValues }) {
  const [state, onSubmit, pending] = useFormAction<SettingsState>(savePickupLocation, {
    status: "idle",
  });
  const id = location.id ?? "new";
  return (
    <form onSubmit={onSubmit} className="grid gap-4 border border-line p-4 md:grid-cols-2">
      {location.id && <input type="hidden" name="id" value={location.id} />}
      <Field label="Name" htmlFor={`pickup-name-${id}`}>
        <Input id={`pickup-name-${id}`} name="name" defaultValue={location.name} required />
      </Field>
      <Field label="Opening hours" htmlFor={`pickup-hours-${id}`}>
        <Input
          id={`pickup-hours-${id}`}
          name="hours"
          defaultValue={location.hours}
          placeholder="Mon–Sat, 10am–6pm"
        />
      </Field>
      <Field label="Street address" htmlFor={`pickup-address-${id}`} className="md:col-span-2">
        <Input
          id={`pickup-address-${id}`}
          name="address"
          defaultValue={location.address}
          required
        />
      </Field>
      <Field label="City" htmlFor={`pickup-city-${id}`}>
        <Input id={`pickup-city-${id}`} name="city" defaultValue={location.city} required />
      </Field>
      <Field label="State" htmlFor={`pickup-state-${id}`}>
        <Select id={`pickup-state-${id}`} name="state" defaultValue={location.state || "FCT"}>
          {NIGERIAN_STATES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Instructions for customers (optional)"
        htmlFor={`pickup-instructions-${id}`}
        className="md:col-span-2"
      >
        <Textarea
          id={`pickup-instructions-${id}`}
          name="instructions"
          rows={2}
          defaultValue={location.instructions}
        />
      </Field>
      <div className="flex items-center gap-4 md:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={location.isActive}
            className="size-4 accent-ink"
          />
          Offer pickup here
        </label>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : location.id ? "Save" : "Add location"}
        </Button>
        <Status state={state} />
      </div>
    </form>
  );
}
