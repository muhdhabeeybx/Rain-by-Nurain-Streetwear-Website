const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats an amount in kobo (the unit the database stores) as naira: ₦45,000. */
export function formatNaira(kobo: number) {
  return naira.format(kobo / 100);
}

/**
 * Reads a naira amount typed by a person ("28,000", "₦28000", "28000.50")
 * and returns kobo, or null if it isn't a valid non-negative amount.
 */
export function parseNaira(input: string) {
  const cleaned = input.replace(/[₦,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number.parseFloat(cleaned) * 100);
}

/** Kobo as a plain naira number for form inputs: 2800000 → "28000". */
export function nairaInputValue(kobo: number | null | undefined) {
  if (kobo == null) return "";
  return kobo % 100 === 0 ? String(kobo / 100) : (kobo / 100).toFixed(2);
}
