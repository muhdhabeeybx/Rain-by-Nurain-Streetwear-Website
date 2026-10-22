import { describe, expect, it } from "vitest";
import { compareSizes } from "./sizes";

describe("compareSizes", () => {
  it("orders letter sizes from small to large", () => {
    expect(["XL", "S", "XXL", "M", "XS", "L"].sort(compareSizes)).toEqual([
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ]);
  });

  it("treats 2XL as XXL and puts numeric sizes after letters", () => {
    expect(["32", "2XL", "28", "One size", "S"].sort(compareSizes)).toEqual([
      "S",
      "2XL",
      "28",
      "32",
      "One size",
    ]);
  });
});
