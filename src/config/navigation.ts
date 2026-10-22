import type { Route } from "next";

type NavLink = { label: string; href: Route };

export const primaryNav: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "New in", href: "/shop?sort=newest" },
  { label: "Our story", href: "/about" },
];

export const helpNav: NavLink[] = [
  { label: "Shipping & delivery", href: "/shipping" },
  { label: "Returns & exchanges", href: "/returns" },
  { label: "Size guide", href: "/size-guide" },
  { label: "Garment care", href: "/care" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const legalNav: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
