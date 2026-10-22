/**
 * Brand facts used across the site. Change them here, not in components.
 */
export const site = {
  name: "Rain by Nurain",
  shortName: "RBN",
  tagline: "Left Home to Feed Home",
  headline: "For the Hustlers & Dreamers",
  description:
    "Rain by Nurain is a streetwear label from Abuja, made for the hustlers and dreamers. Left home to feed home.",
  founded: "MMXXIII",
  city: "Abuja",
  // The old site named the founder both "Nurain Idris" and "Usman Nurain".
  // TODO(launch): confirm the full name before using it anywhere.
  founder: { name: "Nurain", role: "Founder & Creative Director" },
  // TODO(launch): switch to an @rainbynurain.com address once the domain is live.
  email: "rainbynurain@gmail.com",
  social: {
    instagram: { handle: "@rainbynurain", url: "https://www.instagram.com/rainbynurain" },
    tiktok: { handle: "@rainbynurain", url: "https://www.tiktok.com/@rainbynurain" },
  },
  returnWindowHours: 48,
} as const;
