"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const LINKS: { label: string; href: Route }[] = [
  { label: "Overview", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Products", href: "/admin/products" },
  { label: "Delivery", href: "/admin/delivery" },
  { label: "Emails", href: "/admin/emails" },
];

export function AdminNav() {
  return (
    <nav aria-label="Admin" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      {/* The links render immediately; the current-page highlight needs the URL. */}
      <Suspense fallback={<NavLinks />}>
        <CurrentNavLinks />
      </Suspense>
    </nav>
  );
}

function CurrentNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname?: string }) {
  return (
    <ul className="flex gap-1 lg:flex-col">
      {LINKS.map((link) => {
        const active =
          pathname !== undefined &&
          (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href));
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center px-3 type-label whitespace-nowrap transition-colors",
                active ? "bg-ink text-paper" : "hover:bg-mist",
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
