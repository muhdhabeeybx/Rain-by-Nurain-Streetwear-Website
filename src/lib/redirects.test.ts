import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirects";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/admin/orders")).toBe("/admin/orders");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "admin", null, undefined])(
    "falls back for %s",
    (value) => {
      expect(safeNextPath(value)).toBe("/account");
    },
  );
});
