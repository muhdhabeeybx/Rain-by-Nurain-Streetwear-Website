import Image from "next/image";
import { Monogram } from "@/components/brand/logo";
import { productImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  path: string | null | undefined;
  alt: string;
  sizes: string;
  /** Above the fold: fetch immediately at high priority instead of lazily. */
  eager?: boolean;
  className?: string;
};

/** A product photo filling its (positioned) parent, with a branded placeholder. */
export function ProductImage({ path, alt, sizes, eager, className }: ProductImageProps) {
  if (!path) {
    return (
      <div className={cn("absolute inset-0 grid place-items-center bg-mist", className)}>
        <Monogram className="w-1/3 text-line" title={alt} />
      </div>
    );
  }

  return (
    <Image
      src={productImageUrl(path)}
      alt={alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className={cn("object-cover", className)}
    />
  );
}
