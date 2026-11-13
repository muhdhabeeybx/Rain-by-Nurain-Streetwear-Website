import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import localFont from "next/font/local";
import { site } from "@/config/site";
import { env } from "@/lib/env";
import { isPreview } from "@/lib/preview";
import "./globals.css";

// Body copy, labels and prices. Downloaded by scripts/fetch-fonts.ts (it can't
// live in the public repo).
const satoshi = localFont({
  src: "../assets/fonts/Satoshi-Variable.woff2",
  weight: "300 900",
  variable: "--font-satoshi",
  display: "swap",
});

// Headlines. Also the fallback for ₦, which Satoshi doesn't have: latin-ext
// holds it and only downloads on pages that show a price.
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
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
    <html lang="en-NG" className={`${satoshi.variable} ${archivo.variable}`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
