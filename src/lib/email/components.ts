/**
 * Building blocks for transactional email, styled after the storefront: warm
 * paper, near-black ink, square corners, expanded uppercase headlines and
 * small uppercase labels.
 *
 * Email clients are not browsers. Everything here is table layout with inline
 * styles. The site's two typefaces, Satoshi and Archivo, load where supported
 * (Apple Mail, iOS) and fall back to Helvetica/Arial elsewhere (Gmail, Outlook). Logos are opaque PNGs so they
 * survive clients that force dark mode. Pure functions: no env, no I/O.
 */
import { site } from "@/config/site";

export const colors = {
  paper: "#f4f2ee",
  mist: "#e9e6e0",
  line: "#d9d5cc",
  lineStrong: "#8c877f",
  muted: "#67635d",
  ink: "#121212",
  inkMuted: "#a9a49b",
  signal: "#b3261e",
} as const;

const fonts = {
  body: "'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif",
  display: "'Archivo','Helvetica Neue',Helvetica,Arial,sans-serif",
} as const;

/** What every template needs to build absolute links and image URLs. */
export type EmailContext = {
  /** Public site URL without a trailing slash. */
  siteUrl: string;
  /** Absolute URL for a product image path (a small rendition where possible). */
  imageUrl: (path: string) => string;
};

export type RenderedEmail = { subject: string; html: string; text: string };

export function escape(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

const label = (color: string = colors.muted) =>
  `font-family:${fonts.body};font-size:11px;font-weight:600;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:${color}`;

/** Small uppercase mono line above a headline. */
export function eyebrow(text: string, color?: string) {
  return `<p style="margin:0 0 14px;${label(color)}">${escape(text)}</p>`;
}

export function headline(text: string) {
  return `<h1 class="rbn-h1" style="margin:0;font-family:${fonts.display};font-size:38px;font-weight:700;font-stretch:125%;line-height:1;letter-spacing:-0.4px;text-transform:uppercase;color:${colors.ink}">${escape(text)}</h1>`;
}

/** A paragraph. `html` must already be escaped. */
export function paragraph(html: string, options: { muted?: boolean; size?: number } = {}) {
  const size = options.size ?? 15;
  return `<p style="margin:16px 0 0;font-family:${fonts.body};font-size:${size}px;line-height:${Math.round(size * 1.6)}px;color:${options.muted ? colors.muted : colors.ink}">${html}</p>`;
}

/** An order number or amount inside a paragraph, set slightly heavier. */
export function figure(text: string) {
  return `<span style="font-weight:600;font-variant-numeric:tabular-nums;color:${colors.ink}">${escape(text)}</span>`;
}

export function strong(text: string) {
  return `<strong style="font-weight:600;color:inherit">${escape(text)}</strong>`;
}

export function link(text: string, href: string) {
  return `<a href="${escape(href)}" style="color:${colors.ink};text-decoration:underline;text-underline-offset:3px">${escape(text)}</a>`;
}

export function spacer(height: number) {
  return `<div style="height:${height}px;line-height:${height}px;font-size:1px">&nbsp;</div>`;
}

/** Square ink button, the site's primary call to action. Works in Outlook. */
export function button(text: string, href: string, variant: "primary" | "secondary" = "primary") {
  const fill = variant === "primary" ? colors.ink : colors.paper;
  const textColor = variant === "primary" ? colors.paper : colors.ink;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>
<td bgcolor="${fill}" style="background:${fill};border:1px solid ${colors.ink}">
<a href="${escape(href)}" style="display:inline-block;padding:17px 30px;font-family:${fonts.body};font-variant-numeric:tabular-nums;font-size:12px;font-weight:500;line-height:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;color:${textColor}">${escape(text)}&nbsp;&nbsp;&rarr;</a>
</td></tr></table>`;
}

/** The four-step progress bar from the order page. */
export function progress(steps: string[], current: number) {
  const cells = steps
    .map((step, index) => {
      const done = index <= current;
      const pad = index === steps.length - 1 ? "0" : "6px";
      return `<td width="${Math.floor(100 / steps.length)}%" valign="top" style="padding-right:${pad}">
<div style="height:4px;line-height:4px;font-size:1px;background:${done ? colors.ink : colors.line}">&nbsp;</div>
<p class="rbn-step" style="margin:10px 0 0;font-family:${fonts.body};font-variant-numeric:tabular-nums;font-size:10px;font-weight:500;line-height:14px;letter-spacing:1.2px;text-transform:uppercase;color:${done ? colors.ink : colors.muted}">${escape(step)}</p>
</td>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>${cells}</tr></table>`;
}

/** A section title in the site's label style, with a hairline above it. */
export function sectionTitle(text: string) {
  return `<p style="margin:0;padding:0 0 12px;${label(colors.ink)}">${escape(text)}</p>`;
}

export type EmailLine = {
  name: string;
  meta: string;
  amount: string;
  href: string;
  imageUrl: string | null;
};

/** Product rows: 4:5 thumbnail, name, variant details, mono price. */
export function lineItems(lines: EmailLine[]) {
  const rows = lines
    .map((line) => {
      const thumb = line.imageUrl
        ? `<a href="${escape(line.href)}"><img src="${escape(line.imageUrl)}" width="64" height="80" alt="${escape(line.name)}" style="display:block;width:64px;height:80px;object-fit:cover;border:0;background:${colors.mist}"></a>`
        : `<div style="width:64px;height:80px;background:${colors.mist}">&nbsp;</div>`;
      return `<tr>
<td width="64" valign="top" style="padding:16px 16px 16px 0;border-bottom:1px solid ${colors.line}">${thumb}</td>
<td valign="top" style="padding:16px 12px 16px 0;border-bottom:1px solid ${colors.line}">
<a href="${escape(line.href)}" style="font-family:${fonts.body};font-size:15px;line-height:22px;color:${colors.ink};text-decoration:none">${escape(line.name)}</a>
<p style="margin:4px 0 0;font-family:${fonts.body};font-size:13px;line-height:20px;color:${colors.muted}">${escape(line.meta)}</p>
</td>
<td valign="top" align="right" style="padding:16px 0;border-bottom:1px solid ${colors.line};font-family:${fonts.body};font-variant-numeric:tabular-nums;font-size:14px;line-height:22px;color:${colors.ink};white-space:nowrap">${escape(line.amount)}</td>
</tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${colors.ink}">${rows}</table>`;
}

/** Subtotal rows, then the total on an ink rule. */
export function totals(rows: [string, string][], total: [string, string]) {
  const body = rows
    .map(
      ([name, value]) => `<tr>
<td style="padding:5px 0;font-family:${fonts.body};font-size:14px;line-height:20px;color:${colors.muted}">${escape(name)}</td>
<td align="right" style="padding:5px 0;font-family:${fonts.body};font-variant-numeric:tabular-nums;font-size:14px;line-height:20px;color:${colors.ink}">${escape(value)}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:12px">${body}
<tr>
<td style="padding:14px 0 0;border-top:1px solid ${colors.ink};${label(colors.ink)}">${escape(total[0])}</td>
<td align="right" style="padding:14px 0 0;border-top:1px solid ${colors.ink};font-family:${fonts.body};font-variant-numeric:tabular-nums;font-size:18px;font-weight:500;line-height:24px;color:${colors.ink}">${escape(total[1])}</td>
</tr></table>`;
}

export type InfoColumn = { title: string; lines: string[] };

/** Two side-by-side blocks (address, contact…) that stack on phones. */
export function infoColumns(columns: InfoColumn[]) {
  const cells = columns
    .map((column, index) => {
      const lines = column.lines
        .filter(Boolean)
        .map((line) => escape(line))
        .join("<br>");
      const pad = index < columns.length - 1 ? "padding:0 24px 24px 0" : "padding:0 0 24px";
      return `<td class="rbn-stack" width="${Math.floor(100 / columns.length)}%" valign="top" style="${pad}">
<p style="margin:0 0 8px;${label()}">${escape(column.title)}</p>
<p style="margin:0;font-family:${fonts.body};font-size:14px;line-height:22px;color:${colors.ink}">${lines}</p>
</td>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>${cells}</tr></table>`;
}

/** A boxed callout: a tracking number, a pickup code, a warning. */
export function callout(
  title: string,
  bodyHtml: string,
  tone: "neutral" | "inverse" | "warning" = "neutral",
) {
  const styles = {
    neutral: { bg: colors.mist, border: colors.mist, title: colors.muted, text: colors.ink },
    inverse: { bg: colors.ink, border: colors.ink, title: colors.inkMuted, text: colors.paper },
    warning: { bg: colors.paper, border: colors.signal, title: colors.signal, text: colors.ink },
  }[tone];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr>
<td bgcolor="${styles.bg}" style="background:${styles.bg};border:1px solid ${styles.border};padding:20px 22px">
<p style="margin:0 0 8px;${label(styles.title)}">${escape(title)}</p>
<div style="font-family:${fonts.body};font-size:15px;line-height:23px;color:${styles.text}">${bodyHtml}</div>
</td></tr></table>`;
}

/** Large text inside a callout: a tracking number or sign-in code. */
export function code(text: string, size = 22) {
  return `<span style="font-family:${fonts.body};font-variant-numeric:tabular-nums;font-size:${size}px;font-weight:700;line-height:${Math.round(size * 1.3)}px;letter-spacing:${size > 24 ? 8 : 1}px">${escape(text)}</span>`;
}

type LayoutOptions = {
  ctx: EmailContext;
  /** Inbox preview text. Keep it under ~100 characters. */
  preheader: string;
  /** Mono label at the top right of the header, e.g. the order number. */
  reference?: string;
  /** The ink strip above the header, like the site's announcement bar. */
  strip?: string;
  /** Main column content. */
  body: string;
  /** Why the reader got this email, shown in the footer. */
  reason: string;
  /** Store-team emails use a shorter footer without marketing links. */
  audience?: "customer" | "team";
};

export function layout(options: LayoutOptions) {
  const { ctx } = options;
  const footerLinks = [
    ["Shop", `${ctx.siteUrl}/shop`],
    ["Returns", `${ctx.siteUrl}/returns`],
    ["Instagram", site.social.instagram.url],
    ["TikTok", site.social.tiktok.url],
  ]
    .map(
      ([text, href]) =>
        `<a href="${escape(href)}" style="${label(colors.paper)};text-decoration:none">${text}</a>`,
    )
    .join(`<span style="${label(colors.lineStrong)}">&nbsp;&nbsp;/&nbsp;&nbsp;</span>`);

  const customerFooter = `
<tr><td class="rbn-px" style="padding:44px 40px 0">
<p class="rbn-tagline" style="margin:0;font-family:${fonts.display};font-size:26px;font-weight:700;font-stretch:125%;line-height:28px;letter-spacing:-0.2px;text-transform:uppercase;color:${colors.paper}">${escape(site.tagline)}.</p>
<p style="margin:14px 0 0;font-family:${fonts.body};font-size:13px;line-height:20px;color:${colors.inkMuted}">Streetwear from ${escape(site.city)} for the hustlers and dreamers.</p>
<p style="margin:24px 0 0;line-height:16px">${footerLinks}</p>
</td></tr>
<tr><td class="rbn-px" style="padding:36px 40px 0">
<a href="${escape(ctx.siteUrl)}"><img src="${escape(ctx.siteUrl)}/email/rbn-wordmark.png" width="520" alt="${escape(site.name)}" style="display:block;width:100%;max-width:520px;height:auto;border:0"></a>
</td></tr>`;

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escape(site.name)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>body,table,td,p,a,h1,span{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]-->
<!--[if !mso]><!--><link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&amp;display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,600;125,700&amp;display=swap" rel="stylesheet"><!--<![endif]-->
<style>
:root{color-scheme:light only;supported-color-schemes:light only}
body{margin:0!important;padding:0!important;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{border-collapse:collapse}
img{-ms-interpolation-mode:bicubic}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
@media (max-width:620px){
.rbn-px{padding-left:22px!important;padding-right:22px!important}
.rbn-h1{font-size:30px!important;line-height:31px!important}
.rbn-tagline{font-size:21px!important;line-height:24px!important}
.rbn-stack{display:block!important;width:100%!important;padding-right:0!important}
.rbn-step{font-size:9px!important;letter-spacing:0.6px!important}
.rbn-hide-sm{display:none!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${colors.paper}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${colors.paper};opacity:0">${escape(options.preheader)}${"&#8199;&#65279;&#847; ".repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${colors.paper}" style="background:${colors.paper}">
<tr><td align="center" style="padding:24px 10px 32px">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;border-collapse:collapse">
${
  options.strip
    ? `<tr><td bgcolor="${colors.ink}" align="center" style="background:${colors.ink};padding:10px 16px;${label(colors.paper)}">${escape(options.strip)}</td></tr>`
    : ""
}
<tr><td class="rbn-px" style="padding:22px 40px;border-bottom:1px solid ${colors.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle"><a href="${escape(ctx.siteUrl)}"><img src="${escape(ctx.siteUrl)}/email/rbn-monogram.png" width="56" height="38" alt="${escape(site.name)}" style="display:block;width:56px;height:38px;border:0"></a></td>
<td valign="middle" align="right" style="${label(colors.ink)}">${options.reference ? escape(options.reference) : escape(site.name)}</td>
</tr></table>
</td></tr>
<tr><td class="rbn-px" style="padding:44px 40px 48px">
${options.body}
</td></tr>
<tr><td bgcolor="${colors.ink}" style="background:${colors.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${options.audience === "team" ? "" : customerFooter}
<tr><td class="rbn-px" style="padding:28px 40px 32px">
<p style="margin:0;${options.audience === "team" ? "" : "padding-top:20px;border-top:1px solid #2e2d2b;"}font-family:${fonts.body};font-size:12px;line-height:19px;color:${colors.inkMuted}">${escape(options.reason)}</p>
<p style="margin:12px 0 0;${label(colors.inkMuted)}">${escape(site.name)} &middot; ${escape(site.city)}, Nigeria</p>
</td></tr>
</table>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}
