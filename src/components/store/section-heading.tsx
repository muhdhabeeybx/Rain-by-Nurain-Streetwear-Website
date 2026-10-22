import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  action,
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-8 flex reveal items-end justify-between gap-6 md:mb-12", className)}>
      <div>
        {eyebrow && <p className="mb-3 type-label text-muted">{eyebrow}</p>}
        <Heading className="type-display text-display-md">{title}</Heading>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
