import { describe, expect, it } from "vitest";
import { addLine, countItems, MAX_QUANTITY_PER_LINE, setLineQuantity, subtotal } from "./lines";

const tee = {
  variantId: "v-m",
  productId: "p-1",
  slug: "radial-tee-black",
  name: "Radial Tee",
  colorName: "Black",
  size: "M",
  price: 2_500_000,
  imagePath: "radial-tee/front.jpg",
};

describe("cart lines", () => {
  it("merges repeat adds of the same variant", () => {
    const lines = addLine(addLine([], tee, 1), tee, 2);
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("keeps different sizes as separate lines", () => {
    const lines = addLine(addLine([], tee, 1), { ...tee, variantId: "v-l", size: "L" }, 1);
    expect(lines.map((line) => line.size)).toEqual(["M", "L"]);
    expect(countItems(lines)).toBe(2);
  });

  it("caps quantity at available stock and the per-line maximum", () => {
    expect(addLine([], tee, 5, 2)[0].quantity).toBe(2);
    expect(addLine([], tee, 50)[0].quantity).toBe(MAX_QUANTITY_PER_LINE);
  });

  it("does not add anything when the variant is out of stock", () => {
    expect(addLine([], tee, 1, 0)).toEqual([]);
  });

  it("removes only the targeted size when quantity drops to zero", () => {
    const lines = addLine(addLine([], tee, 1), { ...tee, variantId: "v-l", size: "L" }, 1);
    expect(setLineQuantity(lines, "v-m", 0).map((line) => line.variantId)).toEqual(["v-l"]);
  });

  it("totals in kobo", () => {
    expect(subtotal(addLine([], tee, 2))).toBe(5_000_000);
  });
});
