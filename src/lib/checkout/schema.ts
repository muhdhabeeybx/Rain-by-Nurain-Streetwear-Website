import { z } from "zod";
import { MAX_QUANTITY_PER_LINE } from "@/lib/cart/lines";
import { STATE_VALUES } from "@/lib/nigeria";

/**
 * Accepts Nigerian numbers in local (0803…) or international (+234 803…) form,
 * and other international numbers in E.164 form. Returns E.164.
 */
export function normalisePhone(raw: string) {
  const compact = raw.replace(/[\s\-().]/g, "");
  const local = compact.match(/^0([789][01]\d{8})$/);
  if (local) return `+234${local[1]}`;
  const nigerian = compact.match(/^(?:\+?234)([789][01]\d{8})$/);
  if (nigerian) return `+234${nigerian[1]}`;
  if (/^\+[1-9]\d{7,14}$/.test(compact)) return compact;
  return null;
}

const phone = z.string().transform((value, context) => {
  const normalised = normalisePhone(value);
  if (!normalised) {
    context.addIssue({ code: "custom", message: "Enter a valid phone number, e.g. 0803 123 4567" });
    return z.NEVER;
  }
  return normalised;
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined)
    .optional();

export const cartItemsSchema = z
  .array(
    z.object({
      variantId: z.uuid(),
      quantity: z.int().min(1).max(MAX_QUANTITY_PER_LINE),
    }),
  )
  .min(1, "Your bag is empty")
  .max(20, "Too many different items in one order");

const contact = z.object({
  email: z.email("Enter a valid email address").max(254),
  phone,
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  items: cartItemsSchema,
});

export const checkoutSchema = z.discriminatedUnion("fulfillment", [
  contact.extend({
    fulfillment: z.literal("delivery"),
    addressLine1: z.string().trim().min(3, "Enter your street address").max(200),
    addressLine2: optionalText(200),
    city: z.string().trim().min(2, "Enter your city or town").max(100),
    state: z.enum(STATE_VALUES, "Choose your state"),
    deliveryNote: optionalText(500),
  }),
  contact.extend({
    fulfillment: z.literal("pickup"),
    pickupLocationId: z.uuid("Choose a pickup location"),
  }),
]);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutField =
  | "email"
  | "phone"
  | "fullName"
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "state"
  | "deliveryNote"
  | "pickupLocationId";
