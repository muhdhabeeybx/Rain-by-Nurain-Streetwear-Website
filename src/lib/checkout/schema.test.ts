import { describe, expect, it } from "vitest";
import { checkoutSchema, normalisePhone } from "./schema";

const item = { variantId: "6f1c2d4e-8a9b-4c3d-9e2f-1a2b3c4d5e6f", quantity: 1 };

describe("normalisePhone", () => {
  it.each([
    ["0803 123 4567", "+2348031234567"],
    ["08031234567", "+2348031234567"],
    ["+234 803 123 4567", "+2348031234567"],
    ["2349031234567", "+2349031234567"],
    ["0701-123-4567", "+2347011234567"],
    ["+44 7700 900123", "+447700900123"],
  ])("accepts %s", (input, expected) => {
    expect(normalisePhone(input)).toBe(expected);
  });

  it.each(["12345", "0603 123 4567", "080312345678", "phone"])("rejects %s", (input) => {
    expect(normalisePhone(input)).toBeNull();
  });
});

describe("checkoutSchema", () => {
  const base = {
    email: "ada@example.com",
    phone: "0803 123 4567",
    fullName: "Ada Obi",
    items: [item],
  };

  it("requires an address for delivery", () => {
    const result = checkoutSchema.safeParse({ ...base, fulfillment: "delivery", state: "FCT" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["addressLine1", "city"]),
    );
  });

  it("accepts a complete delivery order and normalises it", () => {
    const result = checkoutSchema.parse({
      ...base,
      fulfillment: "delivery",
      addressLine1: " 12 Aminu Kano Crescent ",
      addressLine2: "",
      city: "Wuse II",
      state: "FCT",
    });
    expect(result).toMatchObject({
      phone: "+2348031234567",
      addressLine1: "12 Aminu Kano Crescent",
      addressLine2: undefined,
    });
  });

  it("rejects states that are not Nigerian states", () => {
    const result = checkoutSchema.safeParse({
      ...base,
      fulfillment: "delivery",
      addressLine1: "1 Road",
      city: "Town",
      state: "Texas",
    });
    expect(result.success).toBe(false);
  });

  it("requires a pickup location for pickup", () => {
    expect(checkoutSchema.safeParse({ ...base, fulfillment: "pickup" }).success).toBe(false);
  });

  it("rejects an empty bag and over-limit quantities", () => {
    expect(
      checkoutSchema.safeParse({
        ...base,
        items: [],
        fulfillment: "pickup",
        pickupLocationId: item.variantId,
      }).success,
    ).toBe(false);
    expect(
      checkoutSchema.safeParse({
        ...base,
        items: [{ ...item, quantity: 11 }],
        fulfillment: "pickup",
        pickupLocationId: item.variantId,
      }).success,
    ).toBe(false);
  });
});
