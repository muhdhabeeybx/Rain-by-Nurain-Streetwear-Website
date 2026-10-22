import type { ReactNode } from "react";
import type { Banner } from "@/config/imagery";
import { PageHero } from "./page-hero";

type InfoPageProps = {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  /** Photo banner; legal pages leave it out. */
  banner?: Banner;
  children: ReactNode;
};

/** Layout for help and policy pages. */
export function InfoPage({ eyebrow, title, intro, banner, children }: InfoPageProps) {
  return (
    <article>
      {banner ? (
        <PageHero banner={banner} eyebrow={eyebrow} title={title} intro={intro} />
      ) : (
        <header className="container-page pt-10 md:pt-16">
          <div className="max-w-3xl">
            {eyebrow && <p className="type-label text-muted">{eyebrow}</p>}
            <h1 className="mt-4 type-display text-display-lg">{title}</h1>
            {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>}
          </div>
        </header>
      )}
      <div className="container-page pt-12 pb-24 md:pt-16">
        <div className="prose-info">{children}</div>
      </div>
    </article>
  );
}
