"use client";

import { useRef, useState } from "react";
import type { ProductImage as ProductImageData } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

/**
 * Swipeable on phones, a stacked editorial grid on desktop.
 */
export function ProductGallery({ images, name }: { images: ProductImageData[]; name: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const slides = images.length > 0 ? images : [null];

  const onScroll = () => {
    const list = listRef.current;
    if (list) setCurrent(Math.round(list.scrollLeft / list.clientWidth));
  };

  return (
    <div className="relative">
      <ul
        ref={listRef}
        onScroll={onScroll}
        aria-label={`${name} photos`}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto lg:grid lg:grid-cols-2 lg:gap-2 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((image, index) => (
          <li
            key={image?.path ?? "placeholder"}
            className={cn(
              "relative aspect-4/5 w-full shrink-0 snap-center bg-mist",
              // The first photo, and a last one left alone in its row, span the full width.
              (index === 0 || (index === slides.length - 1 && slides.length % 2 === 0)) &&
                "lg:col-span-2",
            )}
          >
            <ProductImage
              path={image?.path}
              alt={image ? `${image.alt}, photo ${index + 1} of ${slides.length}` : name}
              eager={index === 0}
              sizes={
                index === 0 || (index === slides.length - 1 && slides.length % 2 === 0)
                  ? "(min-width: 1024px) 58vw, 100vw"
                  : "(min-width: 1024px) 29vw, 100vw"
              }
            />
          </li>
        ))}
      </ul>
      {slides.length > 1 && (
        <p
          aria-hidden
          className="absolute right-3 bottom-3 bg-paper/90 px-2 py-1 type-label tabular-nums lg:hidden"
        >
          {current + 1} / {slides.length}
        </p>
      )}
    </div>
  );
}
