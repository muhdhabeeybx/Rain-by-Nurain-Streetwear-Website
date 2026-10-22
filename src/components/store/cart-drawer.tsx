"use client";

import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { type CartLine, countItems, MAX_QUANTITY_PER_LINE, subtotal } from "@/lib/cart/lines";
import { useCart } from "@/lib/cart/store";
import { formatNaira } from "@/lib/money";
import { ProductImage } from "./product-image";

export function CartDrawer() {
  const lines = useCart((state) => state.lines);
  const isOpen = useCart((state) => state.isOpen);
  const setOpen = useCart((state) => state.setOpen);
  const count = countItems(lines);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent title={count > 0 ? `Your bag (${count})` : "Your bag"}>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <p className="type-display text-display-sm">Your bag is empty</p>
            <p className="text-sm text-muted">Pieces you add will wait here for you.</p>
            <SheetClose asChild>
              <Button asChild>
                <Link href="/shop">Shop the collection</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => (
                <CartLineItem key={line.variantId} line={line} />
              ))}
            </ul>
            <div className="space-y-4 border-t border-line p-5">
              <div className="flex items-baseline justify-between">
                <span className="type-label">Subtotal</span>
                <span className="font-mono">{formatNaira(subtotal(lines))}</span>
              </div>
              <p className="text-sm text-muted">
                Delivery is calculated at checkout. Prices and stock are confirmed when you pay.
              </p>
              <SheetClose asChild>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLineItem({ line }: { line: CartLine }) {
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const label = [line.colorName, `Size ${line.size}`].filter(Boolean).join(" · ");

  return (
    <li className="flex gap-4 py-5">
      <SheetClose asChild>
        <Link
          href={`/products/${line.slug}`}
          className="relative aspect-4/5 w-20 shrink-0 overflow-hidden bg-mist"
        >
          <ProductImage path={line.imagePath} alt={line.name} sizes="80px" />
        </Link>
      </SheetClose>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <SheetClose asChild>
              <Link href={`/products/${line.slug}`} className="block truncate hover:underline">
                {line.name}
              </Link>
            </SheetClose>
            <p className="text-sm text-muted">{label}</p>
          </div>
          <p className="font-mono text-sm">{formatNaira(line.price * line.quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center border border-line-strong">
            <button
              type="button"
              onClick={() => setQuantity(line.variantId, line.quantity - 1)}
              aria-label={`Remove one ${line.name}, size ${line.size}`}
              className="grid size-9 cursor-pointer place-items-center hover:bg-mist"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(line.variantId, line.quantity + 1)}
              disabled={line.quantity >= MAX_QUANTITY_PER_LINE}
              aria-label={`Add one more ${line.name}, size ${line.size}`}
              className="grid size-9 cursor-pointer place-items-center hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(line.variantId)}
            className="cursor-pointer type-label text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
