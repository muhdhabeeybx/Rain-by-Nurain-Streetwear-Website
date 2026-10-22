/** Only same-site paths, so a crafted ?next= can't send people elsewhere. */
export function safeNextPath(value: unknown, fallback = "/account") {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : fallback;
}
