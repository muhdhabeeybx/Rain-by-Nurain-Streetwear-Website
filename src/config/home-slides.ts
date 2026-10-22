import type { Route } from "next";
import type { StaticImageData } from "next/image";
import founder from "@/assets/brand/founder.jpg";
import heroCrew from "@/assets/brand/hero-crew.jpg";
import threePs from "@/assets/brand/three-ps.jpg";
import { site } from "./site";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  image: StaticImageData;
  alt: string;
  /** CSS object-position that keeps the subject in frame. */
  position?: string;
  primary: { label: string; href: Route };
  secondary?: { label: string; href: Route };
};

/** The home page slideshow, in order. Swap images here for new campaigns. */
export const HOME_SLIDES: HeroSlide[] = [
  {
    id: "hustlers",
    eyebrow: `${site.city} · Est. ${site.founded}`,
    title: "For the hustlers & dreamers",
    body: "Born from hustle and made for those who turn struggle into rhythm. Each piece carries the story of the streets that shaped us and the worlds we are building.",
    image: heroCrew,
    alt: "The Rain by Nurain crew in graphic tees and wide-leg pants outside a glass-fronted building",
    position: "50% 60%",
    primary: { label: "Shop the collection", href: "/shop" },
    secondary: { label: "Our story", href: "/about" },
  },
  {
    id: "three-ps",
    eyebrow: "The Three P's",
    title: "Pray. Prepare. Plan.",
    body: "Printed across the back of the jersey and carried into everything we make. Pieces built for the long road between where you started and where you are going.",
    image: threePs,
    alt: "The back of a black Three P's jersey reading Pray, Prepare, Plan, beside a grey RAIN polo",
    position: "50% 35%",
    primary: { label: "Shop tees", href: "/shop/tees" as Route },
    secondary: { label: "New in", href: "/shop?sort=newest" },
  },
  {
    id: "built-different",
    eyebrow: "Made in Abuja",
    title: "Built different. Made for the bold.",
    body: "Streetwear with purpose, for creators and believers who live by their grind and wear their story.",
    image: founder,
    alt: "Nurain, the founder, in a tan suit and white sneakers beneath a statue",
    position: "50% 40%",
    primary: { label: "Read our story", href: "/about" },
    secondary: { label: "Shop all", href: "/shop" },
  },
];
