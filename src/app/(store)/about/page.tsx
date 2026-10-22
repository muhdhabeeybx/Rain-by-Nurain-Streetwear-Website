import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import archive from "@/assets/brand/archive.jpg";
import founder from "@/assets/brand/founder.jpg";
import threePs from "@/assets/brand/three-ps.jpg";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Our story",
  description: `${site.name} is streetwear with purpose, born in ${site.city} in ${site.founded}. ${site.tagline}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <header className="container-page pt-10 pb-16 md:pt-16 md:pb-24">
        <p className="type-label text-muted">
          {site.city} · Est. {site.founded}
        </p>
        <h1 className="mt-6 max-w-6xl type-display text-display-xl">
          Built different. Made for the bold.
        </h1>
      </header>

      <section className="container-page grid gap-12 pb-20 lg:grid-cols-12 lg:items-end">
        <div className="relative aspect-4/5 lg:col-span-6">
          <Image
            src={archive}
            alt="Nurain, the founder, in a mint sweatshirt and black tie at a museum gallery"
            fill
            preload
            placeholder="blur"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-ink/85 lg:col-span-5 lg:col-start-8">
          <p>
            {site.name} is streetwear with purpose, made for those who move with vision. Every drop
            reflects hustle, ambition, and the quiet confidence of the streets that raised us.
          </p>
          <p>
            RBN was born in motion, between {site.city} grit and global dreams. It is for those who
            understand that home is not just a place; it is carried within. Every stitch is a salute
            to those who left, who grind, who build, and who return, bringing light, value and
            vision.
          </p>
          <p className="type-display text-display-sm text-ink">{site.tagline}.</p>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="type-label text-ink-muted">The founder</p>
            <h2 className="mt-6 type-display text-display-lg">Vision, grit &amp; style</h2>
            <p className="mt-8 text-lg leading-relaxed text-paper/80">
              From the capital city to the world, {site.founder.name} built {site.name} out of raw
              passion and relentless drive. Self-taught, inspired by street life and global
              minimalism, an idea became a statement brand. Every collection is made for those who
              dare to stand out.
            </p>
          </div>
          <div className="relative aspect-4/5 lg:col-span-6 lg:col-start-7">
            <Image
              src={founder}
              alt="Nurain in a tan suit and white sneakers, seated beneath a statue"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 px-4 py-20 md:px-12 lg:order-2 lg:px-20">
          <p className="type-label text-muted">What we stand on</p>
          <h2 className="type-display text-display-lg">
            Pray.
            <br />
            Prepare.
            <br />
            Plan.
          </h2>
          <ul className="max-w-md space-y-5 text-ink/85">
            <li>
              <strong className="block type-label text-ink">Crafted with care</strong>
              Every piece goes through hands that care, eyes that see detail, and minds that dream
              global.
            </li>
            <li>
              <strong className="block type-label text-ink">Driven by purpose</strong>
              We don&apos;t follow trends; we set the pace. Each collection is built with the
              culture in mind.
            </li>
            <li>
              <strong className="block type-label text-ink">Built to last</strong>
              Quality that ages well, because real style doesn&apos;t expire.
            </li>
          </ul>
        </div>
        <div className="relative aspect-3/4 lg:aspect-auto lg:min-h-[44rem]">
          <Image
            src={threePs}
            alt="The back of a black Three P's jersey reading Pray, Prepare, Plan"
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="container-page py-20 text-center md:py-28">
        <h2 className="type-display text-display-md">Join the movement</h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          New drops, behind the scenes and the community: follow along on Instagram.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/shop">Shop the collection</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href={site.social.instagram.url} target="_blank" rel="noreferrer">
              {site.social.instagram.handle}
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
