/**
 * Garment measurements, in inches, taken with the piece laid flat.
 * Shared by the size guide page and the size guide on product pages.
 */
export type SizeChart = {
  name: string;
  columns: string[];
  rows: { size: string; values: number[] }[];
};

const TOPS: SizeChart = {
  name: "Tops",
  columns: ["Length", "Width (chest)", "Sleeve"],
  rows: [
    { size: "XS", values: [27, 20, 7.5] },
    { size: "S", values: [28, 21.5, 8] },
    { size: "M", values: [29, 23, 8.5] },
    { size: "L", values: [30, 24.5, 9] },
    { size: "XL", values: [31, 26, 9.5] },
    { size: "XXL", values: [32, 27.5, 10] },
  ],
};

// TODO(launch): add a pants chart once the measurements are confirmed.
const CHARTS_BY_CATEGORY: Record<string, SizeChart> = {
  tees: TOPS,
  polos: TOPS,
  hoodies: TOPS,
  outerwear: TOPS,
};

export const ALL_CHARTS = [TOPS];

/** The chart that applies to a category, or null if there isn't one yet. */
export function sizeChartFor(categorySlug: string) {
  return CHARTS_BY_CATEGORY[categorySlug] ?? null;
}

export const HOW_TO_MEASURE = [
  { label: "Length", text: "From the highest point of the shoulder to the bottom hem." },
  { label: "Width", text: "Straight across the chest, armpit to armpit." },
  { label: "Sleeve", text: "From the shoulder seam to the end of the sleeve." },
];

export const FIT_NOTES = [
  { label: "Oversized", text: "Relaxed and roomy for a modern streetwear shape." },
  { label: "Dropped shoulder", text: "The shoulder seam sits below your natural shoulder." },
  { label: "Boxy", text: "A straight body that doesn't taper at the waist." },
];

export const FIT_SUMMARY =
  "Our tops are cut slightly oversized, with a dropped shoulder and a boxy body. If you like a closer fit, size down.";
