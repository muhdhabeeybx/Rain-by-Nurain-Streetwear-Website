import { describe, expect, it } from "vitest";
import { formatNaira, nairaInputValue, parseNaira } from "./money";

describe("formatNaira", () => {
  it("formats kobo as whole naira with grouping", () => {
    expect(formatNaira(4_500_000)).toBe("₦45,000");
    expect(formatNaira(125_000_000)).toBe("₦1,250,000");
    expect(formatNaira(0)).toBe("₦0");
  });

  it("rounds stray kobo to the nearest naira", () => {
    expect(formatNaira(4_500_049)).toBe("₦45,000");
    expect(formatNaira(4_500_050)).toBe("₦45,001");
  });
});

describe("parseNaira", () => {
  it.each([
    ["28000", 2_800_000],
    ["28,000", 2_800_000],
    ["₦ 28,000", 2_800_000],
    ["28000.5", 2_800_050],
    ["0", 0],
  ])("reads %s", (input, kobo) => {
    expect(parseNaira(input)).toBe(kobo);
  });

  it.each(["", "abc", "-5", "1.234", "28 000 naira"])("rejects %s", (input) => {
    expect(parseNaira(input)).toBeNull();
  });
});

describe("nairaInputValue", () => {
  it("shows whole naira without decimals", () => {
    expect(nairaInputValue(2_800_000)).toBe("28000");
    expect(nairaInputValue(2_800_050)).toBe("28000.50");
    expect(nairaInputValue(null)).toBe("");
  });
});
