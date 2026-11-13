import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import heroCrew from "@/assets/brand/hero-crew.jpg";
import threePs from "@/assets/brand/three-ps.jpg";
import { requireAdmin } from "@/lib/admin/auth";
import type { EmailContext } from "@/lib/email/components";
import { EMAIL_PREVIEWS } from "@/lib/email/previews";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { EmailFrame } from "./email-frame";

export const metadata: Metadata = { title: "Emails" };

export default function AdminEmailsPage({ searchParams }: PageProps<"/admin/emails">) {
  return (
    <>
      <h1 className="type-display text-display-md">Emails</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Every email the store sends, shown with a made-up order. They go out automatically: you
        never need to send one by hand.
      </p>
      <Suspense fallback={<div aria-hidden className="mt-8 h-96 animate-pulse bg-mist" />}>
        {searchParams.then(({ email }) => (
          <EmailPreviews selected={typeof email === "string" ? email : undefined} />
        ))}
      </Suspense>
    </>
  );
}

async function EmailPreviews({ selected }: { selected?: string }) {
  await requireAdmin();

  const preview =
    EMAIL_PREVIEWS.find((candidate) => candidate.key === selected) ?? EMAIL_PREVIEWS[0];
  // Sample products use brand photography so the preview looks like the real thing.
  const ctx: EmailContext = {
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    imageUrl: (path) => (path.includes("hoodie") ? heroCrew.src : threePs.src),
  };
  const email = preview.render(ctx);

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[16rem_1fr]">
      <nav aria-label="Emails">
        {(["Customer", "Team"] as const).map((audience) => (
          <div key={audience} className="mb-6">
            <p className="mb-2 type-label text-muted">
              {audience === "Customer" ? "To customers" : "To the RBN team"}
            </p>
            <ul className="flex flex-wrap gap-1 xl:flex-col">
              {EMAIL_PREVIEWS.filter((item) => item.audience === audience).map((item) => (
                <li key={item.key}>
                  <Link
                    href={`/admin/emails?email=${item.key}` as Route}
                    aria-current={item.key === preview.key ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center px-3 text-sm whitespace-nowrap",
                      item.key === preview.key ? "bg-ink text-paper" : "hover:bg-mist",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <section aria-labelledby="email-subject" className="min-w-0">
        <dl className="grid gap-x-6 gap-y-2 border-y border-line py-4 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="type-label text-muted">Subject</dt>
          <dd id="email-subject">{email.subject}</dd>
          <dt className="type-label text-muted">Sent when</dt>
          <dd>{preview.when}</dd>
        </dl>
        <EmailFrame html={email.html} title={`${preview.label} email preview`} />
        <details className="mt-6 border-t border-line pt-4">
          <summary className="cursor-pointer type-label">Plain-text version</summary>
          <pre className="mt-4 overflow-x-auto bg-mist p-4 text-xs leading-relaxed whitespace-pre-wrap tabular-nums">
            {email.text}
          </pre>
        </details>
      </section>
    </div>
  );
}
