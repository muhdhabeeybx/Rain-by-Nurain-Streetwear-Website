import Image from "next/image";
import type { ReactNode } from "react";
import type { Banner } from "@/config/imagery";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  banner: Banner;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  /** `sm` keeps listing pages quick to scan; `lg` suits editorial pages. */
  size?: "sm" | "lg";
};

/** A full-width photo banner with the page title set over it. */
export function PageHero({ banner, eyebrow, title, intro, size = "lg" }: PageHeroProps) {
  return (
    <header
      className={cn(
        "relative isolate flex items-end overflow-hidden bg-ink text-paper",
        size === "lg"
          ? "min-h-[22rem] md:h-[56svh] md:min-h-[26rem]"
          : "min-h-[15rem] md:h-[38svh] md:min-h-[18rem]",
      )}
    >
      <Image
        src={banner.image}
        alt={banner.alt}
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="animate-hero-zoom object-cover"
        style={{ objectPosition: banner.position ?? "50% 50%" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/35 to-ink/10"
      />
      <div className="relative container-page pt-24 pb-8 md:pb-12">
        {eyebrow && <p className="animate-rise type-label text-paper/70">{eyebrow}</p>}
        <h1
          className={cn(
            "mt-3 max-w-4xl animate-rise type-display [--delay:80ms]",
            size === "lg" ? "text-display-lg" : "text-display-md",
          )}
        >
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-2xl animate-rise text-paper/80 [--delay:160ms] md:text-lg">
            {intro}
          </p>
        )}
      </div>
    </header>
  );
}
