"use client";

import { Menu } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { InstagramIcon, TikTokIcon } from "@/components/brand/social-icons";
import { helpNav } from "@/config/navigation";
import { site } from "@/config/site";

type MobileMenuProps = { categories: { slug: string; name: string }[] };

export function MobileMenu({ categories }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Open menu"
        className="-ml-2 grid size-10 cursor-pointer place-items-center lg:hidden"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent side="left" title="Menu">
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-8">
          <ul className="space-y-1">
            <MenuLink href="/shop" large>
              Shop all
            </MenuLink>
            {categories.map((category) => (
              <MenuLink key={category.slug} href={`/shop/${category.slug}` as Route} large>
                {category.name}
              </MenuLink>
            ))}
            <MenuLink href="/shop?sort=newest" large>
              New in
            </MenuLink>
            <MenuLink href="/about" large>
              Our story
            </MenuLink>
          </ul>
          <ul className="mt-10 space-y-1 border-t border-line pt-6">
            <MenuLink href="/account">Account</MenuLink>
            {helpNav.map((link) => (
              <MenuLink key={link.href} href={link.href}>
                {link.label}
              </MenuLink>
            ))}
          </ul>
        </nav>
        <div className="flex gap-6 border-t border-line p-5 type-label text-muted">
          <a
            href={site.social.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-ink"
          >
            <InstagramIcon className="size-4" />
            Instagram
          </a>
          <a
            href={site.social.tiktok.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-ink"
          >
            <TikTokIcon className="size-4" />
            TikTok
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MenuLink({
  href,
  large,
  children,
}: {
  href: Route;
  large?: boolean;
  children: ReactNode;
}) {
  return (
    <li>
      <SheetClose asChild>
        <Link
          href={href}
          className={
            large
              ? "block py-2 type-display text-display-sm hover:opacity-60"
              : "block py-2 text-[0.9375rem] text-muted hover:text-ink"
          }
        >
          {children}
        </Link>
      </SheetClose>
    </li>
  );
}
