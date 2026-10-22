import { ArrowUpRight, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InstagramIcon, TikTokIcon } from "@/components/brand/social-icons";
import { InfoPage } from "@/components/store/info-page";
import { banners } from "@/config/imagery";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} about an order, sizing, wholesale or collaborations.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Help"
      banner={banners.contact}
      title="Contact"
      intro="Questions about an order, sizing or a collaboration? We usually reply within one business day."
    >
      <ul className="not-prose grid gap-3 sm:grid-cols-3">
        {[
          { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
          {
            icon: InstagramIcon,
            label: "Instagram",
            value: site.social.instagram.handle,
            href: site.social.instagram.url,
          },
          {
            icon: TikTokIcon,
            label: "TikTok",
            value: site.social.tiktok.handle,
            href: site.social.tiktok.url,
          },
        ].map((channel) => (
          <li key={channel.label} className="reveal">
            <a
              href={channel.href}
              target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="group flex h-full flex-col border border-line p-5 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              <span className="flex items-center justify-between">
                <channel.icon aria-hidden strokeWidth={1.5} className="size-6" />
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
              <span className="mt-6 type-label text-muted group-hover:text-paper/70">
                {channel.label}
              </span>
              <span className="mt-1 text-sm break-words">{channel.value}</span>
            </a>
          </li>
        ))}
      </ul>
      <p>
        For anything about an order, include your order number (it starts with RBN-) so we can help
        faster. You can also find your order from the link in your confirmation email, or by{" "}
        <Link href="/account">signing in</Link>.
      </p>

      <h2>Before you write</h2>
      <ul>
        <li>
          <Link href="/shipping">Shipping &amp; delivery</Link>: fees, timings and where we deliver.
        </li>
        <li>
          <Link href="/returns">Returns &amp; exchanges</Link>: our {site.returnWindowHours}-hour
          exchange policy.
        </li>
        <li>
          <Link href="/size-guide">Size guide</Link>: measurements for every size.
        </li>
        <li>
          <Link href="/faq">FAQ</Link>: quick answers to common questions.
        </li>
      </ul>
    </InfoPage>
  );
}
