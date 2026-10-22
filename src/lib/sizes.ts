const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/**
 * Orders sizes the way a customer reads them: letter sizes small to large,
 * then numeric sizes ascending, then anything else alphabetically.
 */
export function compareSizes(a: string, b: string) {
  const rank = (size: string): [number, number, string] => {
    const upper = size.trim().toUpperCase();
    const letter = LETTER_SIZES.indexOf(upper === "2XL" ? "XXL" : upper === "3XL" ? "XXXL" : upper);
    if (letter !== -1) return [0, letter, upper];
    const numeric = Number.parseFloat(upper);
    if (!Number.isNaN(numeric)) return [1, numeric, upper];
    return [2, 0, upper];
  };
  const [groupA, valueA, textA] = rank(a);
  const [groupB, valueB, textB] = rank(b);
  return groupA - groupB || valueA - valueB || textA.localeCompare(textB);
}
