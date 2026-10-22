import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/store/info-page";
import { banners } from "@/config/imagery";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Returns & exchanges",
  description: `${site.name} offers exchanges and returns within ${site.returnWindowHours} hours of delivery on unworn pieces.`,
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  const hours = site.returnWindowHours;
  return (
    <InfoPage
      eyebrow="Help"
      banner={banners.returns}
      title="Returns & exchanges"
      intro={`We want you to love your RBN pieces. If something isn't right, you have ${hours} hours from delivery to ask for an exchange or a refund.`}
    >
      <h2>What we accept</h2>
      <ul>
        <li>Unworn, unwashed pieces in their original condition</li>
        <li>Tags still attached and original packaging</li>
        <li>Requests made within {hours} hours of delivery</li>
      </ul>

      <h2>What we can&apos;t accept</h2>
      <ul>
        <li>Worn, washed or damaged pieces</li>
        <li>Pieces without tags</li>
        <li>Custom or personalised pieces</li>
        <li>Sale pieces, which are final sale</li>
      </ul>

      <h2>When it&apos;s on us</h2>
      <p>
        If we sent the wrong size, or your piece arrived faulty or damaged, we&apos;ll exchange it
        or refund you in full, including delivery. Tell us within {hours} hours and include a photo.
      </p>

      <h2>How to return or exchange</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Email <a href={`mailto:${site.email}?subject=Return request`}>{site.email}</a> with your
          order number, the piece, and whether you&apos;d like an exchange or a refund.
        </li>
        <li>We&apos;ll reply with a return authorisation and where to send it.</li>
        <li>Pack the piece in its original condition with the tags attached.</li>
        <li>
          Once it arrives and we&apos;ve checked it, we send your exchange, or refund your original
          payment method through Paystack within 5–7 business days.
        </li>
      </ol>

      <h2>Exchanges</h2>
      <p>
        Need a different size? Size exchanges are free: we cover delivery of the replacement. If the
        size you want has sold out, we&apos;ll refund you instead.
      </p>

      <p>
        Not sure about fit before you order? Check the <Link href="/size-guide">size guide</Link>.
      </p>
    </InfoPage>
  );
}
