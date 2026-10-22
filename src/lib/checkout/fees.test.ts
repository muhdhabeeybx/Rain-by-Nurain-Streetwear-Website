import { describe, expect, it } from "vitest";
import { deliveryEstimate, deliveryFeeFor, deliveryRange, zoneForState } from "./fees";

const abuja = {
  id: "z1",
  name: "Abuja (FCT)",
  fee: 300_000,
  freeOver: 10_000_000,
  minDays: 1,
  maxDays: 2,
  states: ["FCT"],
};

describe("delivery fees", () => {
  it("charges the zone fee below the free threshold and nothing at or above it", () => {
    expect(deliveryFeeFor(abuja, 9_999_999)).toBe(300_000);
    expect(deliveryFeeFor(abuja, 10_000_000)).toBe(0);
    expect(deliveryFeeFor({ ...abuja, freeOver: null }, 99_000_000)).toBe(300_000);
  });

  it("finds the zone that covers a state", () => {
    expect(zoneForState([abuja], "FCT")?.id).toBe("z1");
    expect(zoneForState([abuja], "Lagos")).toBeNull();
  });

  it("summarises fees and timings across zones", () => {
    const lagos = { ...abuja, id: "z2", fee: 600_000, freeOver: null, minDays: 2, maxDays: 4 };
    expect(deliveryRange([abuja, lagos])).toEqual({
      fromFee: 300_000,
      minDays: 1,
      maxDays: 4,
      freeOver: 10_000_000,
    });
    expect(deliveryRange([])).toBeNull();
  });

  it("describes delivery time", () => {
    expect(deliveryEstimate(abuja)).toBe("1–2 business days");
    expect(deliveryEstimate({ minDays: 1, maxDays: 1 })).toBe("1 business day");
  });
});
