import type { Metadata } from "next";
import { InfoPage } from "@/components/store/info-page";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy" },
};

// DRAFT: written to match how the store actually handles data. Have it
// reviewed against the Nigeria Data Protection Act 2023 before launch.
export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="Last updated 21 October 2026" title="Privacy policy">
      <p>
        This policy explains what personal information {site.name} (&ldquo;we&rdquo;) collects when
        you use this website, why, and the choices you have. We process personal data in line with
        the Nigeria Data Protection Act 2023.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>When you order:</strong> your name, email address, phone number and delivery
          address, and what you bought.
        </li>
        <li>
          <strong>When you sign in:</strong> your email address and, if you add them, your name and
          phone number.
        </li>
        <li>
          <strong>Payments:</strong> handled entirely by Paystack. We receive confirmation that you
          paid and the amount, never your card or bank details.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To process, deliver and support your orders, including refunds and exchanges</li>
        <li>To send you order confirmations and delivery updates</li>
        <li>To let you sign in and see your order history</li>
        <li>To prevent fraud and meet our legal and accounting obligations</li>
      </ul>
      <p>
        We don&apos;t sell your personal information, and we don&apos;t send marketing email unless
        you ask us to.
      </p>

      <h2>Who we share it with</h2>
      <p>Only the services we need to run the store, each bound to protect your data:</p>
      <ul>
        <li>Paystack, to take payments</li>
        <li>Supabase, which hosts our database and sign-in</li>
        <li>Our email provider, to send order emails</li>
        <li>Our delivery partners, who receive your name, phone number and address</li>
      </ul>

      <h2>Cookies and local storage</h2>
      <p>
        We use a cookie to keep you signed in, and your browser&apos;s local storage to remember
        your bag. We don&apos;t use advertising or tracking cookies.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep order records for as long as the law requires for tax and accounting. You can ask us
        to delete your account at any time.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete the personal information we hold about you, or object
        to how we use it. Email <a href={`mailto:${site.email}`}>{site.email}</a> and we&apos;ll
        respond within 30 days.
      </p>
    </InfoPage>
  );
}
