import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/store/info-page";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of sale",
  alternates: { canonical: "/terms" },
};

// DRAFT: have it reviewed by a Nigerian lawyer before launch.
export default function TermsPage() {
  return (
    <InfoPage eyebrow="Last updated 21 October 2026" title="Terms of sale">
      <p>
        These terms apply when you buy from {site.name} through this website. By placing an order
        you agree to them.
      </p>

      <h2>Prices and payment</h2>
      <p>
        Prices are in Nigerian naira and include any applicable taxes. Delivery is charged
        separately and shown at checkout before you pay. Payment is taken by Paystack. We may change
        prices at any time, but never for an order you have already paid for.
      </p>

      <h2>Your order</h2>
      <p>
        When you start payment we reserve your pieces for 30 minutes. Your order is accepted once
        your payment is confirmed and we email you a confirmation. If we can&apos;t fulfil an order
        after payment (for example, because of a stock error) we&apos;ll tell you and refund you in
        full.
      </p>

      <h2>Delivery</h2>
      <p>
        We deliver within Nigeria. Delivery times are estimates; we&apos;ll keep you updated if
        anything changes. See <Link href="/shipping">shipping &amp; delivery</Link>.
      </p>

      <h2>Returns and exchanges</h2>
      <p>
        You can request a return or exchange within {site.returnWindowHours} hours of delivery, as
        set out in our <Link href="/returns">returns policy</Link>. This doesn&apos;t affect your
        rights under Nigerian consumer protection law.
      </p>

      <h2>Our designs</h2>
      <p>
        The {site.name} name, logos, graphics and photography on this site belong to us. Please
        don&apos;t reproduce them without permission.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </InfoPage>
  );
}
