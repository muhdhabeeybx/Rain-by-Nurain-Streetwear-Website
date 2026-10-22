/** Garment care, shared by the care page and product pages. */
export type CareSection = {
  id: "washing" | "drying" | "ironing" | "storage";
  title: string;
  items: string[];
};

export const CARE_SECTIONS: CareSection[] = [
  {
    id: "washing",
    title: "Washing",
    items: [
      "Machine wash cold, 30°C maximum",
      "Turn pieces inside out",
      "Use a mild detergent and wash with similar colours",
      "No bleach or fabric softener",
    ],
  },
  {
    id: "drying",
    title: "Drying",
    items: [
      "Air dry, laid flat or on a hanger, out of direct sun",
      "If you must tumble dry, use low heat and take pieces out while slightly damp",
    ],
  },
  {
    id: "ironing",
    title: "Ironing",
    items: [
      "Iron inside out on a medium setting",
      "Never iron directly on prints; use a pressing cloth or steam instead",
    ],
  },
  {
    id: "storage",
    title: "Storage",
    items: [
      "Fold knits and heavy tees; hang shirts and outerwear",
      "Keep in a cool, dry place away from direct light",
    ],
  },
];

export const CARE_SUMMARY =
  "Wash cold and inside out, line dry, and never iron directly on prints.";
