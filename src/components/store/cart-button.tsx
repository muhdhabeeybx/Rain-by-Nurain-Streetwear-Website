"use client";

import { ShoppingBag } from "lucide-react";
import { countItems } from "@/lib/cart/lines";
import { useCart } from "@/lib/cart/store";

export function CartButton() {
  const count = useCart((state) => countItems(state.lines));
  const setOpen = useCart((state) => state.setOpen);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex h-10 cursor-pointer items-center gap-1.5 px-2 type-label hover:opacity-70"
      aria-label={count > 0 ? `Bag, ${count} ${count === 1 ? "item" : "items"}` : "Bag, empty"}
    >
      <ShoppingBag aria-hidden className="size-[1.125rem]" strokeWidth={1.5} />
      <span className="hidden md:inline">Bag</span>
      {/* Keyed by count so the badge pops each time something is added. */}
      <span
        key={count}
        aria-hidden
        className="grid h-5 min-w-5 animate-bump place-items-center bg-ink px-1 text-[0.625rem] text-paper tabular-nums"
      >
        {count}
      </span>
    </button>
  );
}
