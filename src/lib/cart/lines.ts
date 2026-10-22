/** The database accepts at most this many of one variant per order. */
export const MAX_QUANTITY_PER_LINE = 10;

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  colorName: string | null;
  size: string;
  /** Kobo, as shown when added. Checkout always re-prices from the database. */
  price: number;
  imagePath: string | null;
  quantity: number;
};

const clamp = (quantity: number, max: number) =>
  Math.max(0, Math.min(Math.floor(quantity), max, MAX_QUANTITY_PER_LINE));

/**
 * Adds a variant, merging with an existing line. `available` caps the total
 * at the stock the shopper could see when adding.
 */
export function addLine(
  lines: CartLine[],
  line: Omit<CartLine, "quantity">,
  quantity: number,
  available = MAX_QUANTITY_PER_LINE,
): CartLine[] {
  const existing = lines.find((item) => item.variantId === line.variantId);
  const next = clamp((existing?.quantity ?? 0) + quantity, available);
  if (next === 0) return lines.filter((item) => item.variantId !== line.variantId);
  if (existing) {
    return lines.map((item) =>
      item.variantId === line.variantId ? { ...item, ...line, quantity: next } : item,
    );
  }
  return [...lines, { ...line, quantity: next }];
}

/** Sets a line's quantity; zero or less removes it. */
export function setLineQuantity(lines: CartLine[], variantId: string, quantity: number) {
  const next = clamp(quantity, MAX_QUANTITY_PER_LINE);
  return next === 0
    ? lines.filter((item) => item.variantId !== variantId)
    : lines.map((item) => (item.variantId === variantId ? { ...item, quantity: next } : item));
}

export function countItems(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function subtotal(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.price * line.quantity, 0);
}
