"use client";

import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ProductImage } from "@/components/store/product-image";
import { Button } from "@/components/ui/button";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { addProductImage, deleteImage, moveImage, updateImageAlt } from "./actions";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024;

type Image = { id: string; path: string; alt: string };

function readDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => reject(new Error(`${file.name} isn't a readable image`));
    image.src = url;
  });
}

export function ImageManager({
  productId,
  productName,
  images,
}: {
  productId: string;
  productName: string;
  images: Image[];
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const upload = async (files: FileList) => {
    setError(null);
    const supabase = createBrowserSupabase();
    for (const [index, file] of [...files].entries()) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`${file.name}: use JPG, PNG, WebP or AVIF.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is over 10 MB. Export a smaller version and try again.`);
        continue;
      }
      setUploading(`Uploading ${index + 1} of ${files.length}…`);
      try {
        const { width, height } = await readDimensions(file);
        const extension = file.type.split("/")[1].replace("jpeg", "jpg");
        const path = `${productId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
        if (uploadError) throw uploadError;
        await addProductImage({ productId, path, width, height });
      } catch (cause) {
        setError(`${file.name}: ${cause instanceof Error ? cause.message : "upload failed"}`);
      }
    }
    setUploading(null);
    if (input.current) input.current.value = "";
    router.refresh();
  };

  const run = (task: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await task();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Something went wrong");
      }
    });

  return (
    <section aria-labelledby="images-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="images-heading" className="type-label">
          Photos
        </h2>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={Boolean(uploading)}
          onClick={() => input.current?.click()}
        >
          <Upload /> {uploading ?? "Add photos"}
        </Button>
        <input
          ref={input}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          hidden
          onChange={(event) => event.target.files?.length && upload(event.target.files)}
        />
      </div>
      <p className="mb-4 text-sm text-muted">
        The first photo is the main one; the second shows on hover in the shop. Portrait (4:5)
        photos look best.
      </p>
      {error && (
        <p role="alert" className="mb-4 text-sm text-signal">
          {error}
        </p>
      )}
      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="grid aspect-4/5 w-40 cursor-pointer place-items-center border border-dashed border-line-strong text-sm text-muted hover:border-ink hover:text-ink"
        >
          No photos yet
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" aria-busy={isPending}>
          {images.map((image, index) => (
            <li key={image.id} className="space-y-2">
              <div className="relative aspect-4/5 overflow-hidden bg-mist">
                <ProductImage path={image.path} alt={image.alt || productName} sizes="200px" />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-paper px-2 py-1 type-label">Main</span>
                )}
              </div>
              <input
                aria-label={`Description of photo ${index + 1}`}
                defaultValue={image.alt}
                placeholder="Describe the photo"
                onBlur={(event) =>
                  event.target.value !== image.alt &&
                  run(() => updateImageAlt(image.id, event.target.value))
                }
                className="h-9 w-full border border-line-strong bg-transparent px-2 text-sm focus:border-ink focus:outline-none"
              />
              <div className="flex justify-between">
                <div className="flex">
                  <IconButton
                    label="Move earlier"
                    disabled={index === 0 || isPending}
                    onClick={() => run(() => moveImage(image.id, "earlier"))}
                  >
                    <ArrowUp className="size-4" />
                  </IconButton>
                  <IconButton
                    label="Move later"
                    disabled={index === images.length - 1 || isPending}
                    onClick={() => run(() => moveImage(image.id, "later"))}
                  >
                    <ArrowDown className="size-4" />
                  </IconButton>
                </div>
                <IconButton
                  label="Delete photo"
                  disabled={isPending}
                  onClick={() => confirm("Delete this photo?") && run(() => deleteImage(image.id))}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 cursor-pointer place-items-center hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
