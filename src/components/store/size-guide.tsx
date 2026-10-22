import { Ruler } from "lucide-react";
import Link from "next/link";
import {
  FIT_NOTES,
  FIT_SUMMARY,
  HOW_TO_MEASURE,
  type SizeChart,
  sizeChartFor,
} from "@/content/size-guide";
import { cn } from "@/lib/utils";

const inches = (value: number) => `${value}″`;
const cm = (value: number) => `${Math.round(value * 2.54)} cm`;

export function SizeChartTable({
  chart,
  highlight,
  className,
}: {
  chart: SizeChart;
  highlight?: string[];
  className?: string;
}) {
  return (
    <div className={cn("-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      <table className="w-full border-t border-ink text-left text-sm">
        <thead>
          <tr className="type-label text-muted">
            <th className="py-3 pr-4 font-medium">Size</th>
            {chart.columns.map((column) => (
              <th key={column} className="py-3 pr-4 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono">
          {chart.rows.map((row) => (
            <tr
              key={row.size}
              className={cn("border-t border-line", highlight?.includes(row.size) && "bg-mist/70")}
            >
              <th scope="row" className="py-3 pr-4 font-medium text-ink">
                {row.size}
              </th>
              {row.values.map((value, index) => (
                <td key={chart.columns[index]} className="py-3 pr-4 whitespace-nowrap">
                  {inches(value)}
                  <span className="block text-xs text-muted">{cm(value)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Everything a shopper needs to pick a size, for one category. */
export function SizeGuideContent({
  categorySlug,
  sizes,
}: {
  categorySlug: string;
  sizes?: string[];
}) {
  const chart = sizeChartFor(categorySlug);

  return (
    <div className="space-y-8">
      <p className="text-ink/85">{FIT_SUMMARY}</p>
      {chart ? (
        <div>
          <h3 className="mb-3 type-label">Measurements · {chart.name}</h3>
          <SizeChartTable chart={chart} highlight={sizes} />
          <p className="mt-3 text-sm text-muted">Measured with the piece laid flat.</p>
        </div>
      ) : (
        <p className="border-l-2 border-ink pl-4 text-sm">
          Detailed measurements for this piece are on the way.{" "}
          <Link href="/contact" className="underline underline-offset-4">
            Message us
          </Link>{" "}
          and we&apos;ll measure it for you.
        </p>
      )}
      <div>
        <h3 className="mb-3 type-label">How to measure</h3>
        <ul className="space-y-3 text-sm">
          {HOW_TO_MEASURE.map((step) => (
            <li key={step.label} className="flex gap-3">
              <Ruler aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-muted" />
              <span>
                <strong className="font-medium">{step.label}:</strong> {step.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-3 type-label">The fit</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          {FIT_NOTES.map((note) => (
            <div key={note.label} className="border border-line p-3">
              <dt className="font-medium">{note.label}</dt>
              <dd className="mt-1 text-muted">{note.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
