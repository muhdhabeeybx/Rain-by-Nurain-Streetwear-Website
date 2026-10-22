import { CartDrawer } from "@/components/store/cart-drawer";
import { CartSync } from "@/components/store/cart-sync";
import { SiteFooter } from "@/components/store/site-footer";
import { AnnouncementBar, SiteHeader } from "@/components/store/site-header";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-3 type-label text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <CartSync />
    </>
  );
}
