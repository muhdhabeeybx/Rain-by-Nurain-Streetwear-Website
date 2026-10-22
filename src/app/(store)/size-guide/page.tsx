import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/store/info-page";
import { SizeChartTable } from "@/components/store/size-guide";
import { banners } from "@/config/imagery";
import { ALL_CHARTS, FIT_NOTES, FIT_SUMMARY, HOW_TO_MEASURE } from "@/content/size-guide";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Measurements for every Rain by Nurain size, in inches and centimetres.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <InfoPage eyebrow="Help" title="Size guide" intro={FIT_SUMMARY} banner={banners.sizeGuide}>
      {ALL_CHARTS.map((chart) => (
        <section key={chart.name} className="reveal">
          <h2>{chart.name}</h2>
          <p>Measurements are of the garment laid flat, not of your body.</p>
          <div className="not-prose mt-6">
            <SizeChartTable chart={chart} />
          </div>
        </section>
      ))}

      <section className="reveal">
        <h2>How to measure</h2>
        <p>Lay a tee you love flat and compare it with the table.</p>
        <ol className="not-prose mt-6 grid gap-3 sm:grid-cols-3">
          {HOW_TO_MEASURE.map((step, index) => (
            <li key={step.label} className="border border-line p-4">
              <span className="font-mono text-sm text-muted">0{index + 1}</span>
              <p className="mt-2 font-medium">{step.label}</p>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="reveal">
        <h2>The fit</h2>
        <ul>
          {FIT_NOTES.map((note) => (
            <li key={note.label}>
              <strong>{note.label}:</strong>{" "}
              {note.text.charAt(0).toLowerCase() + note.text.slice(1)}
            </li>
          ))}
        </ul>
        <p>
          Product pages note any piece that fits differently. Still unsure?{" "}
          <Link href="/contact">Ask us</Link> and we&apos;ll help you pick.
        </p>
      </section>
    </InfoPage>
  );
}
