import Link from "next/link";
import type { ReactNode } from "react";
import { Monogram } from "@/components/brand/logo";
import { InstagramIcon } from "@/components/brand/social-icons";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

/** Stands in for checkout, accounts and the admin while the site is a preview. */
export function PreviewNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center md:py-32">
      <Monogram title="" className="h-12 w-auto" />
      <p className="mt-10 type-label text-muted">Preview</p>
      <h1 className="mt-4 max-w-3xl type-display text-display-lg">{title}</h1>
      <p className="mt-6 max-w-lg text-muted">{children}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Browse the collection</Link>
        </Button>
        <Button asChild variant="secondary">
          <a href={site.social.instagram.url} target="_blank" rel="noreferrer">
            <InstagramIcon className="size-4" />
            {site.social.instagram.handle}
          </a>
        </Button>
      </div>
    </div>
  );
}
