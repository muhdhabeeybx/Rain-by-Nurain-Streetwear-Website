import { Search, User } from "lucide-react";
import Link from "next/link";
import { Monogram } from "@/components/brand/logo";
import { primaryNav } from "@/config/navigation";
import { site } from "@/config/site";
import { getCategories } from "@/lib/catalog";
import { isPreview, PREVIEW_MESSAGE } from "@/lib/preview";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";

export function AnnouncementBar() {
  if (isPreview) {
    return (
      <div className="bg-ink text-paper">
        <p className="container-page flex h-9 items-center justify-center text-center type-label">
          {PREVIEW_MESSAGE}
        </p>
      </div>
    );
  }
  return (
    <div className="bg-ink text-paper">
      <p className="container-page flex h-9 items-center justify-center text-center type-label">
        Delivery across Nigeria
        <span className="hidden sm:inline">&nbsp;· Secure payment with Paystack</span>
      </p>
    </div>
  );
}

export async function SiteHeader() {
  const categories = (await getCategories()).filter((category) => category.productCount > 0);

  return (
    <header className="sticky top-0 z-40 elevate-on-scroll border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center">
          <MobileMenu categories={categories} />
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex gap-8">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="type-label hover:opacity-60">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Link href="/" aria-label={`${site.name}, home`} className="justify-self-center">
          <Monogram title="" className="h-7 w-auto md:h-8" />
        </Link>

        <div className="flex items-center justify-end gap-1 md:gap-3">
          <Link
            href="/search"
            aria-label="Search"
            className="grid size-10 place-items-center hover:opacity-60"
          >
            <Search className="size-[1.125rem]" strokeWidth={1.5} />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="flex h-10 items-center gap-2 px-2 type-label hover:opacity-60"
          >
            <User aria-hidden className="size-[1.125rem]" strokeWidth={1.5} />
            <span className="hidden md:inline">Account</span>
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
