import type { Route } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { InstagramIcon, TikTokIcon } from "@/components/brand/social-icons";
import { helpNav, legalNav } from "@/config/navigation";
import { site } from "@/config/site";
import { getCategories } from "@/lib/catalog";

export async function SiteFooter() {
  const categories = (await getCategories()).filter((category) => category.productCount > 0);

  const shopLinks: { label: string; href: Route }[] = [
    { label: "Shop all", href: "/shop" },
    ...categories.map((category) => ({
      label: category.name,
      href: `/shop/${category.slug}` as Route,
    })),
  ];

  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-5">
          <p className="max-w-md type-display text-display-md">{site.tagline}.</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-muted">
            Streetwear from {site.city} for the hustlers and dreamers. Est. {site.founded}.
          </p>
          <ul className="mt-8 flex gap-6 type-label">
            <li>
              <a
                href={site.social.instagram.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:opacity-60"
              >
                <InstagramIcon className="size-4" />
                Instagram
              </a>
            </li>
            <li>
              <a
                href={site.social.tiktok.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:opacity-60"
              >
                <TikTokIcon className="size-4" />
                TikTok
              </a>
            </li>
          </ul>
        </div>
        <FooterColumn title="Shop" links={shopLinks} className="md:col-span-2 md:col-start-7" />
        <FooterColumn title="Help" links={helpNav} className="md:col-span-2" />
        <FooterColumn
          title="Rain by Nurain"
          links={[
            { label: "Our story", href: "/about" },
            { label: "Account", href: "/account" },
          ]}
          className="md:col-span-2"
        />
      </div>

      <div className="container-page pb-6">
        <Wordmark title="" className="h-auto w-full reveal" />
      </div>

      <div className="container-page flex flex-col gap-3 border-t border-paper/15 py-6 type-label text-ink-muted md:flex-row md:items-center md:justify-between">
        <p>
          © <CopyrightYear /> {site.name}. {site.city}, Nigeria.
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-10">
          <ul className="flex gap-6">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="normal-case">
            <span aria-hidden>✦ </span>Site by SableBoxx
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { label: string; href: Route }[];
  className?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="type-label text-ink-muted">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:opacity-60">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
