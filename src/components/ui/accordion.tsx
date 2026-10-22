"use client";

import { Plus } from "lucide-react";
import { Accordion as Primitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Accordion({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root className={cn("border-t border-line", className)} {...props} />;
}

type AccordionItemProps = {
  value: string;
  title: ReactNode;
  /** A small icon element shown before the title, e.g. <Ruler />. */
  icon?: ReactNode;
  children: ReactNode;
};

export function AccordionItem({ value, title, icon, children }: AccordionItemProps) {
  return (
    <Primitive.Item value={value} className="border-b border-line">
      <Primitive.Header>
        <Primitive.Trigger className="group flex w-full cursor-pointer items-center justify-between py-5 text-left type-label">
          <span className="flex items-center gap-3 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]">
            {icon}
            {title}
          </span>
          <Plus
            aria-hidden
            strokeWidth={1.5}
            className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-45"
          />
        </Primitive.Trigger>
      </Primitive.Header>
      <Primitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pb-6 text-[0.9375rem] leading-relaxed text-ink/80">{children}</div>
      </Primitive.Content>
    </Primitive.Item>
  );
}
