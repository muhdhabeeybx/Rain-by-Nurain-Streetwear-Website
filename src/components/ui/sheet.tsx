"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

type SheetContentProps = {
  title: ReactNode;
  side?: "left" | "right";
  className?: string;
  children: ReactNode;
};

/** A full-height panel that slides in from the side of the screen. */
export function SheetContent({ title, side = "right", className, children }: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <Dialog.Content
        aria-describedby={undefined}
        className={cn(
          "fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-paper focus:outline-none",
          side === "right"
            ? "right-0 data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right"
            : "left-0 data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left",
          className,
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <Dialog.Title className="type-label">{title}</Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="-mr-2 grid size-10 cursor-pointer place-items-center hover:bg-mist"
          >
            <X className="size-5" strokeWidth={1.5} />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
