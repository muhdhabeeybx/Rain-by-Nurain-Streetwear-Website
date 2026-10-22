import type { StaticImageData } from "next/image";
import archive from "@/assets/brand/archive.jpg";
import founder from "@/assets/brand/founder.jpg";
import heroCrew from "@/assets/brand/hero-crew.jpg";
import threePs from "@/assets/brand/three-ps.jpg";

/**
 * Banner photography for each page. Swap `image` here when new campaign shots
 * arrive; `position` is the CSS object-position that keeps the subject in frame.
 */
export type Banner = { image: StaticImageData; alt: string; position?: string };

const CREW: Banner = {
  image: heroCrew,
  alt: "The Rain by Nurain crew in graphic tees and wide-leg pants outside a glass-fronted building",
  position: "50% 55%",
};
const THREE_PS: Banner = {
  image: threePs,
  alt: "The back of a black Three P's jersey reading Pray, Prepare, Plan, beside a grey RAIN polo",
  position: "50% 35%",
};
const ARCHIVE: Banner = {
  image: archive,
  alt: "A mint Rain by Nurain sweatshirt worn with a shirt and black tie in a museum gallery",
  position: "50% 40%",
};
const FOUNDER: Banner = {
  image: founder,
  alt: "Nurain, the founder, in a tan suit and white sneakers beneath a statue",
  position: "50% 45%",
};

export const banners = {
  shop: { ...THREE_PS, position: "50% 42%" },
  shipping: { ...CREW, position: "50% 25%" },
  returns: { ...FOUNDER, position: "50% 30%" },
  sizeGuide: { ...THREE_PS, position: "30% 45%" },
  care: ARCHIVE,
  faq: { ...CREW, position: "50% 70%" },
  contact: { ...FOUNDER, position: "50% 55%" },
} satisfies Record<string, Banner>;

const CATEGORY_BANNERS: Record<string, Banner> = {
  tees: THREE_PS,
  polos: { ...THREE_PS, position: "25% 40%" },
  pants: { ...CREW, position: "50% 85%" },
  hoodies: ARCHIVE,
  outerwear: FOUNDER,
};

export function categoryBanner(slug: string) {
  return CATEGORY_BANNERS[slug] ?? banners.shop;
}
