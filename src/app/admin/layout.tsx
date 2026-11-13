import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Monogram } from "@/components/brand/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { PreviewNotice } from "@/components/store/preview-notice";
import { requireAdmin } from "@/lib/admin/auth";
import { isPreview } from "@/lib/preview";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b border-line bg-paper lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-4 lg:px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <Monogram title="" className="h-6 w-auto" />
            <span className="type-label">Admin</span>
          </Link>
          <Link href="/" className="type-label text-muted hover:text-ink lg:hidden">
            View store ↗
          </Link>
        </div>
        <div className="px-4 pb-3 lg:px-3 lg:pt-4">
          <AdminNav />
        </div>
        <div className="mt-auto hidden px-5 py-5 lg:absolute lg:bottom-0 lg:block">
          <Link href="/" className="type-label text-muted hover:text-ink">
            View store ↗
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-10 lg:py-10">
        <Suspense fallback={<div aria-hidden className="h-64 animate-pulse bg-mist" />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  if (isPreview) {
    return (
      <PreviewNotice title="Admin opens with the shop">
        Orders, products and delivery settings are managed here once the store&apos;s database is
        connected.
      </PreviewNotice>
    );
  }
  await requireAdmin();
  return children;
}
