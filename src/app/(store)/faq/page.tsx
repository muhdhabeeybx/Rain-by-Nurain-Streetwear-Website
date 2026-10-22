import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { InfoPage } from "@/components/store/info-page";
import { banners } from "@/config/imagery";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ordering, payment, delivery, sizing and returns at Rain by Nurain.",
  alternates: { canonical: "/faq" },
};

const SECTIONS: { title: string; questions: { q: string; a: ReactNode }[] }[] = [
  {
    title: "Ordering & payment",
    questions: [
      {
        q: "How do I pay?",
        a: "Checkout runs on Paystack. You can pay by debit or credit card, bank transfer or USSD. We never see or store your card details.",
      },
      {
        q: "Do I need an account?",
        a: (
          <>
            No. You can check out as a guest. If you <Link href="/account">sign in</Link> later with
            the same email, your past orders appear in your account.
          </>
        ),
      },
      {
        q: "Is my order confirmed as soon as I pay?",
        a: "Yes. As soon as Paystack confirms your payment you'll see your order page and get a confirmation email. Bank transfers can take a few minutes to confirm.",
      },
      {
        q: "Something sold out while I was checking out. Was I charged?",
        a: "No. We reserve your pieces when you start payment, so if something sells out before then, checkout tells you and nothing is charged.",
      },
    ],
  },
  {
    title: "Delivery",
    questions: [
      {
        q: "Where do you deliver?",
        a: "To every state in Nigeria. International delivery is coming soon.",
      },
      {
        q: "How much is delivery and how long does it take?",
        a: (
          <>
            It depends on your state. Your fee and estimated time appear at checkout before you pay.
            See <Link href="/shipping">shipping &amp; delivery</Link> for every zone.
          </>
        ),
      },
      {
        q: "How do I track my order?",
        a: "Use the link in your confirmation email, or sign in to your account. We email you when your order is dispatched.",
      },
    ],
  },
  {
    title: "Sizing & care",
    questions: [
      {
        q: "How do your pieces fit?",
        a: (
          <>
            Our tops are cut slightly oversized with a dropped shoulder. Size down for a closer fit.
            The <Link href="/size-guide">size guide</Link> has every measurement.
          </>
        ),
      },
      {
        q: "How should I wash my pieces?",
        a: (
          <>
            Cold, inside out, and never iron directly on prints. Read the full{" "}
            <Link href="/care">care guide</Link>.
          </>
        ),
      },
    ],
  },
  {
    title: "Returns",
    questions: [
      {
        q: "Can I return or exchange something?",
        a: (
          <>
            Yes, within {site.returnWindowHours} hours of delivery for unworn pieces with tags. Size
            exchanges are free. Sale pieces are final sale.{" "}
            <Link href="/returns">Read the returns policy</Link>.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Help"
      banner={banners.faq}
      title="FAQ"
      intro={
        <>
          Quick answers to common questions. Can&apos;t find yours?{" "}
          <Link href="/contact" className="text-paper underline underline-offset-4">
            Get in touch
          </Link>
          .
        </>
      }
    >
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <Accordion type="multiple" className="mt-6">
            {section.questions.map((item) => (
              <AccordionItem key={item.q} value={item.q} title={item.q}>
                {item.a}
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </InfoPage>
  );
}
