/** "Three P's Jersey" + "Black" → "three-ps-jersey-black". Matches the database's slug check. */
export function slugify(...parts: (string | null | undefined)[]) {
  return parts
    .filter(Boolean)
    .join(" ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
