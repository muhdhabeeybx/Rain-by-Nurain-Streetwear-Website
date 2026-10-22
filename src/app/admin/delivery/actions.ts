"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { DELIVERY_TAG } from "@/lib/delivery";
import { parseNaira } from "@/lib/money";
import { STATE_VALUES } from "@/lib/nigeria";

export type SettingsState = { status: "idle" | "saved" | "error"; message?: string };

function done(message = "Saved."): SettingsState {
  updateTag(DELIVERY_TAG);
  revalidatePath("/admin/delivery");
  return { status: "saved", message };
}

const zoneSchema = z
  .object({
    id: z.uuid().optional(),
    name: z.string().trim().min(2, "Name the zone").max(60),
    fee: z.string(),
    freeOver: z.string(),
    minDays: z.coerce.number().int().min(0).max(60),
    maxDays: z.coerce.number().int().min(0).max(60),
    isActive: z.boolean(),
  })
  .refine(
    (zone) => zone.maxDays >= zone.minDays,
    "The longest time can't be shorter than the shortest",
  );

export async function saveZone(
  _previous: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { supabase } = await requireAdmin();
  const parsed = zoneSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    fee: formData.get("fee"),
    freeOver: formData.get("freeOver"),
    minDays: formData.get("minDays"),
    maxDays: formData.get("maxDays"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const fee = parseNaira(parsed.data.fee);
  const freeOver = parsed.data.freeOver.trim() ? parseNaira(parsed.data.freeOver) : null;
  if (fee === null) return { status: "error", message: "Enter the fee in naira, e.g. 3000" };
  if (parsed.data.freeOver.trim() && !freeOver)
    return {
      status: "error",
      message: "Enter the free-delivery amount in naira, or leave it blank",
    };

  const row = {
    name: parsed.data.name,
    fee,
    free_over: freeOver,
    min_days: parsed.data.minDays,
    max_days: parsed.data.maxDays,
    is_active: parsed.data.isActive,
  };
  const { error } = parsed.data.id
    ? await supabase.from("delivery_zones").update(row).eq("id", parsed.data.id)
    : await supabase.from("delivery_zones").insert(row);
  if (error) {
    return {
      status: "error",
      message: error.code === "23505" ? "Another zone already has that name" : error.message,
    };
  }
  return done();
}

export async function saveZoneStates(
  _previous: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { supabase } = await requireAdmin();
  const assigned: { state: (typeof STATE_VALUES)[number]; zone_id: string }[] = [];
  const unassigned: string[] = [];
  for (const state of STATE_VALUES) {
    const zoneId = String(formData.get(`state:${state}`) ?? "");
    if (z.uuid().safeParse(zoneId).success) assigned.push({ state, zone_id: zoneId });
    else unassigned.push(state);
  }

  if (assigned.length) {
    const { error } = await supabase
      .from("delivery_zone_states")
      .upsert(assigned, { onConflict: "state" });
    if (error) return { status: "error", message: error.message };
  }
  if (unassigned.length) {
    const { error } = await supabase.from("delivery_zone_states").delete().in("state", unassigned);
    if (error) return { status: "error", message: error.message };
  }
  return done(
    unassigned.length ? `Saved. ${unassigned.length} states have no delivery.` : "Saved.",
  );
}

const pickupSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Name the location").max(80),
  address: z.string().trim().min(5, "Enter the street address").max(200),
  city: z.string().trim().min(2, "Enter the city").max(80),
  state: z.enum(STATE_VALUES),
  hours: z
    .string()
    .trim()
    .max(120)
    .transform((value) => value || null),
  instructions: z
    .string()
    .trim()
    .max(500)
    .transform((value) => value || null),
  isActive: z.boolean(),
});

export async function savePickupLocation(
  _previous: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { supabase } = await requireAdmin();
  const parsed = pickupSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    hours: formData.get("hours") ?? "",
    instructions: formData.get("instructions") ?? "",
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const { id, isActive, ...location } = parsed.data;
  const row = { ...location, is_active: isActive };
  const { error } = id
    ? await supabase.from("pickup_locations").update(row).eq("id", id)
    : await supabase.from("pickup_locations").insert(row);
  if (error) return { status: "error", message: error.message };
  return done();
}
