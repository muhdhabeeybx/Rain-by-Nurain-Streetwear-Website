import { Archive, Thermometer, WashingMachine, Wind } from "lucide-react";
import { CARE_SECTIONS, type CareSection } from "@/content/care";
import { cn } from "@/lib/utils";

const ICONS: Record<CareSection["id"], typeof Wind> = {
  washing: WashingMachine,
  drying: Wind,
  ironing: Thermometer,
  storage: Archive,
};

/** Care instructions as icon cards. `compact` fits the product page accordion. */
export function CareGuide({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={cn("grid gap-3", compact ? "sm:grid-cols-2" : "md:grid-cols-2")}>
      {CARE_SECTIONS.map((section) => {
        const Icon = ICONS[section.id];
        return (
          <li key={section.id} className={cn("border border-line", compact ? "p-4" : "reveal p-6")}>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid shrink-0 place-items-center bg-ink text-paper",
                  compact ? "size-8" : "size-10",
                )}
              >
                <Icon aria-hidden strokeWidth={1.5} className={compact ? "size-4" : "size-5"} />
              </span>
              <h3 className="type-label">{section.title}</h3>
            </div>
            <ul
              className={cn("mt-4 space-y-2 text-ink/85", compact ? "text-sm" : "text-[0.9375rem]")}
            >
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="mt-2.5 size-1 shrink-0 bg-ink/50" />
                  {item}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
