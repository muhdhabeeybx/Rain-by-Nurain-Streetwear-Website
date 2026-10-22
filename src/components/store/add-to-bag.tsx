"use client";

import { Check, Ruler } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { ProductVariant } from "@/lib/catalog";
import type { CartLine } from "@/lib/cart/lines";
import { useCart } from "@/lib/cart/store";
import { formatNaira } from "@/lib/money";
import { cn } from "@/lib/utils";

const LOW_STOCK = 3;

type AddToBagProps = {
  product: Omit<CartLine, "variantId" | "size" | "quantity">;
  variants: ProductVariant[];
  /** Size guide shown in a side panel, so shoppers never leave the page. */
  sizeGuide: ReactNode;
};

export function AddToBag({ product, variants, sizeGuide }: AddToBagProps) {
  const inStock = variants.filter((variant) => variant.stock > 0);
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.length === 1 && inStock.length === 1 ? inStock[0].id : null,
  );
  const [needsSize, setNeedsSize] = useState(false);
  const add = useCart((state) => state.add);
  const inBag = useCart(
    (state) => state.lines.find((line) => line.variantId === selectedId)?.quantity ?? 0,
  );

  const pickerRef = useRef<HTMLFieldSetElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  useEffect(() => {
    const target = buttonRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) =>
      setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const selected = variants.find((variant) => variant.id === selectedId) ?? null;
  const soldOut = inStock.length === 0;
  const allInBag = selected !== null && inBag >= selected.stock;

  const addToBag = () => {
    if (!selected) {
      setNeedsSize(true);
      pickerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add({ ...product, variantId: selected.id, size: selected.size }, 1, selected.stock);
    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1800);
  };

  const label = justAdded ? (
    <>
      <Check className="animate-rise" /> Added to bag
    </>
  ) : soldOut ? (
    "Sold out"
  ) : allInBag ? (
    "All available stock is in your bag"
  ) : (
    `Add to bag · ${formatNaira(product.price)}`
  );

  return (
    <div className="space-y-6">
      <fieldset ref={pickerRef} className="scroll-mt-32">
        <div className="mb-3 flex items-baseline justify-between">
          <legend className="type-label">Size{selected ? `: ${selected.size}` : ""}</legend>
          <Sheet>
            <SheetTrigger className="flex cursor-pointer items-center gap-1.5 type-label text-muted underline underline-offset-4 hover:text-ink">
              <Ruler aria-hidden strokeWidth={1.5} className="size-3.5" />
              Size guide
            </SheetTrigger>
            <SheetContent title="Size guide">
              <div className="flex-1 overflow-y-auto p-5">{sizeGuide}</div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {variants.map((variant) => {
            const unavailable = variant.stock <= 0;
            const isSelected = variant.id === selectedId;
            return (
              <label
                key={variant.id}
                className={cn(
                  "grid h-12 cursor-pointer place-items-center border font-mono text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                  isSelected
                    ? "border-ink bg-ink text-paper"
                    : "border-line-strong hover:border-ink",
                  unavailable &&
                    "cursor-not-allowed border-line text-muted line-through hover:border-line",
                )}
              >
                <input
                  type="radio"
                  name="size"
                  value={variant.id}
                  checked={isSelected}
                  disabled={unavailable}
                  onChange={() => {
                    setSelectedId(variant.id);
                    setNeedsSize(false);
                  }}
                  className="sr-only"
                />
                {variant.size}
                {unavailable && <span className="sr-only">, sold out</span>}
              </label>
            );
          })}
        </div>
        <p className="mt-3 min-h-5 text-sm" aria-live="polite">
          {needsSize && !selected ? (
            <span className="text-signal">Choose a size first.</span>
          ) : selected && selected.stock <= LOW_STOCK ? (
            <span className="text-signal">
              Only {selected.stock} left in {selected.size}.
            </span>
          ) : null}
        </p>
      </fieldset>

      <div ref={buttonRef}>
        <Button
          size="lg"
          className="w-full"
          onClick={addToBag}
          disabled={!justAdded && (soldOut || allInBag)}
          aria-live="polite"
        >
          {label}
        </Button>
      </div>

      <div
        aria-hidden={!showStickyBar}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-3 backdrop-blur transition-transform duration-300 lg:hidden",
          showStickyBar ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <Button
          size="lg"
          className="w-full"
          onClick={addToBag}
          disabled={!justAdded && (soldOut || allInBag)}
          tabIndex={showStickyBar ? 0 : -1}
        >
          {selected ? label : soldOut ? "Sold out" : "Select a size"}
        </Button>
      </div>
    </div>
  );
}
