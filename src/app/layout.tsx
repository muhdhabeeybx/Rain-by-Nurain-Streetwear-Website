import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import { isPreview } from "@/lib/preview";
import "./globals.css";

// Body copy. Downloaded by scripts/fetch-fonts.ts (it can't live in the public repo).
const generalSans = localFont({
  src: "../assets/fonts/GeneralSans-Variable.woff2",
  weight: "200 700",
  variable: "--font-general-sans",
  display: "swap",
});

// Headlines. Prices use the mono face, so only it preloads latin-ext (which
// holds ₦). Archivo's latin-ext still loads on demand if a page needs it.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${site.name} — ${site.headline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_NG",
  },
  twitter: { card: "summary_large_image" },
  ...(isPreview && { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-NG"
      className={`${generalSans.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
