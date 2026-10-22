import { describe, expect, it } from "vitest";
import { SLUG_PATTERN, slugify } from "./slug";

describe("slugify", () => {
  it("builds URL-safe slugs from a name and colour", () => {
    expect(slugify("Three P's Jersey", "Black")).toBe("three-ps-jersey-black");
    expect(slugify("  Café — Crème  ")).toBe("cafe-creme");
    expect(slugify("MMXXIII Polo", null)).toBe("mmxxiii-polo");
  });

  it("produces slugs the database accepts", () => {
    for (const name of ["Radial Jersey", "Tee #1 (Limited)", "--x--"]) {
      expect(slugify(name)).toMatch(SLUG_PATTERN);
    }
  });
});
