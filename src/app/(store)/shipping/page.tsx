import { House, PackageCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/store/info-page";
import { banners } from "@/config/imagery";
import { deliveryEstimate } from "@/lib/checkout/fees";
import { getDeliveryOptions } from "@/lib/delivery";
import { formatNaira } from "@/lib/money";
import { stateLabel } from "@/lib/nigeria";

export const metadata: Metadata = {
  title: "Shipping & delivery",
  description:
    "Delivery fees, timings and pickup options for Rain by Nurain orders across Nigeria.",
  alternates: { canonical: "/shipping" },
};

export default async function ShippingPage() {
  const { zones, pickupLocations } = await getDeliveryOptions();

  return (
    <InfoPage
      eyebrow="Help"
      banner={banners.shipping}
      title="Shipping & delivery"
      intro="We deliver to every state in Nigeria. You'll see your exact delivery fee and estimated delivery time at checkout, before you pay."
    >
      <h2>How it works</h2>
      <ol className="not-prose grid reveal gap-3 sm:grid-cols-3">
        {[
          {
            icon: PackageCheck,
            title: "We prepare it",
            text: "Within one business day of your payment being confirmed.",
          },
          {
            icon: Truck,
            title: "We dispatch it",
            text: "And email you when it's on its way, with tracking if your area has it.",
          },
          {
            icon: House,
            title: "It arrives",
            text: "Within the estimated time for your area. Our rider calls before delivery.",
          },
        ].map((step, index) => (
          <li key={step.title} className="border border-line p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center bg-ink text-paper">
                <step.icon aria-hidden strokeWidth={1.5} className="size-5" />
              </span>
              <span className="text-sm text-muted tabular-nums">0{index + 1}</span>
            </div>
            <p className="mt-4 font-medium">{step.title}</p>
            <p className="mt-1 text-sm text-muted">{step.text}</p>
          </li>
        ))}
      </ol>

      {zones.length > 0 && (
        <>
          <h2>Delivery fees</h2>
          <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="w-full border-t border-ink text-left text-sm">
              <thead>
                <tr className="type-label text-muted">
                  <th className="py-3 pr-4 font-medium">Zone</th>
                  <th className="py-3 pr-4 font-medium">Fee</th>
                  <th className="hidden py-3 font-medium sm:table-cell">Delivery time</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id} className="border-t border-line align-top">
                    <td className="py-4 pr-4">
                      <span className="text-ink">{zone.name}</span>
                      <span className="block text-muted">
                        {zone.states.map(stateLabel).join(", ")}
                      </span>
                    </td>
                    <td className="py-4 pr-4 whitespace-nowrap tabular-nums">
                      {formatNaira(zone.fee)}
                      {zone.freeOver !== null && (
                        <span className="block text-muted">
                          Free over {formatNaira(zone.freeOver)}
                        </span>
                      )}
                      <span className="block font-sans text-muted sm:hidden">
                        {deliveryEstimate(zone)}
                      </span>
                    </td>
                    <td className="hidden py-4 whitespace-nowrap sm:table-cell">
                      {deliveryEstimate(zone)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Delivery times are in business days and start once your order is dispatched.</p>
        </>
      )}

      {pickupLocations.length > 0 && (
        <>
          <h2>Free pickup</h2>
          {pickupLocations.map((location) => (
            <p key={location.id}>
              <strong>{location.name}</strong>
              <br />
              {location.address}, {location.city}
              {location.hours && (
                <>
                  <br />
                  {location.hours}
                </>
              )}
            </p>
          ))}
          <p>
            Choose pickup at checkout. We&apos;ll email you when your order is ready to collect.
          </p>
        </>
      )}

      <h2>International orders</h2>
      <p>
        We currently deliver within Nigeria only. International shipping is coming; follow us on
        Instagram to hear first.
      </p>

      <h2>Questions</h2>
      <p>
        Track your order from the link in your confirmation email or in{" "}
        <Link href="/account">your account</Link>. For anything else,{" "}
        <Link href="/contact">get in touch</Link>.
      </p>
    </InfoPage>
  );
}
