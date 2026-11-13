"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input, Select, Textarea } from "@/components/ui/field";
import { slugify } from "@/lib/slug";
import { useFormAction } from "@/lib/use-form-action";
import { type ProductFormState, saveProduct } from "./actions";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  price: string;
  compareAtPrice: string;
  colorName: string;
  colorHex: string;
  styleCode: string;
  description: string;
  details: string;
  sortOrder: number;
  variants: { id?: string; size: string; stock: number; sku: string }[];
};

type VariantRow = ProductFormValues["variants"][number] & { key: string };

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

export function ProductForm({
  values,
  categories,
}: {
  values: ProductFormValues;
  categories: { id: string; name: string }[];
}) {
  const [state, onSubmit, saving] = useFormAction<ProductFormState>(saveProduct, {
    status: "idle",
  });
  const [name, setName] = useState(values.name);
  const [colorName, setColorName] = useState(values.colorName);
  const [slug, setSlug] = useState(values.slug);
  const [colorHex, setColorHex] = useState(values.colorHex || "#121212");
  const [rows, setRows] = useState<VariantRow[]>(() =>
    values.variants.length > 0
      ? values.variants.map((variant) => ({ ...variant, key: variant.id ?? crypto.randomUUID() }))
      : values.id
        ? []
        : DEFAULT_SIZES.map((size) => ({ size, stock: 0, sku: "", key: crypto.randomUUID() })),
  );
  const errors = state.fieldErrors ?? {};
  const suggestedSlug = slugify(name, colorName);

  const updateRow = (key: string, patch: Partial<VariantRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  return (
    <form onSubmit={onSubmit} className="space-y-12" noValidate>
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(
          rows.map(({ id, size, stock, sku }) =>
            id ? { id, size, stock, sku } : { size, stock, sku },
          ),
        )}
      />

      <section className="grid gap-5 md:grid-cols-2">
        <h2 className="type-label md:col-span-2">Product</h2>
        <Field label="Name" htmlFor="name" error={errors.name} className="md:col-span-2">
          <Input
            {...describedBy("name", errors.name)}
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field
          label="Colour name"
          htmlFor="colorName"
          error={errors.colorName}
          hint="Shown on the product, e.g. Black"
        >
          <Input
            {...describedBy("colorName", errors.colorName, true)}
            name="colorName"
            value={colorName}
            onChange={(event) => setColorName(event.target.value)}
          />
        </Field>
        <Field label="Colour swatch" htmlFor="colorHex" error={errors.colorHex}>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="Pick swatch colour"
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
              className="h-12 w-14 cursor-pointer border border-line-strong bg-transparent p-1"
            />
            <Input
              {...describedBy("colorHex", errors.colorHex)}
              name="colorHex"
              value={colorHex}
              onChange={(event) => setColorHex(event.target.value)}
              className="tabular-nums"
            />
          </div>
        </Field>
        <Field label="Category" htmlFor="categoryId" error={errors.categoryId}>
          <Select
            {...describedBy("categoryId", errors.categoryId)}
            name="categoryId"
            defaultValue={values.categoryId}
            required
          >
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Style code (optional)"
          htmlFor="styleCode"
          error={errors.styleCode}
          hint="Give colourways of the same garment the same code to link them, e.g. radial-jersey"
        >
          <Input
            {...describedBy("styleCode", errors.styleCode, true)}
            name="styleCode"
            defaultValue={values.styleCode}
          />
        </Field>
        <Field
          label="Description"
          htmlFor="description"
          error={errors.description}
          className="md:col-span-2"
        >
          <Textarea
            {...describedBy("description", errors.description)}
            name="description"
            rows={4}
            defaultValue={values.description}
          />
        </Field>
        <Field
          label="Details"
          htmlFor="details"
          hint="One per line: fabric, fit, print…"
          className="md:col-span-2"
        >
          <Textarea
            {...describedBy("details", undefined, true)}
            name="details"
            rows={4}
            defaultValue={values.details}
          />
        </Field>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <h2 className="type-label md:col-span-2">Pricing</h2>
        <Field label="Price (₦)" htmlFor="price" error={errors.price}>
          <Input
            {...describedBy("price", errors.price)}
            name="price"
            inputMode="decimal"
            defaultValue={values.price}
            placeholder="28000"
            className="tabular-nums"
            required
          />
        </Field>
        <Field
          label="Original price (₦, optional)"
          htmlFor="compareAtPrice"
          error={errors.compareAtPrice}
          hint="Set this to show the product as on sale"
        >
          <Input
            {...describedBy("compareAtPrice", errors.compareAtPrice, true)}
            name="compareAtPrice"
            inputMode="decimal"
            defaultValue={values.compareAtPrice}
            className="tabular-nums"
          />
        </Field>
      </section>

      <section>
        <h2 className="mb-2 type-label">Sizes &amp; stock</h2>
        <p className="mb-4 text-sm text-muted">Sizes appear on the product page in this order.</p>
        {errors.variants && (
          <p role="alert" className="mb-4 text-sm text-signal">
            {errors.variants}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-md text-sm">
            <thead className="text-left type-label text-muted">
              <tr>
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">In stock</th>
                <th className="pb-2 font-medium">SKU (optional)</th>
                <th className="pb-2">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.key}>
                  <td className="py-1 pr-2">
                    <Input
                      aria-label={`Size ${index + 1}`}
                      value={row.size}
                      onChange={(event) => updateRow(row.key, { size: event.target.value })}
                      className="h-10 w-24 tabular-nums"
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      aria-label={`Stock for ${row.size || `size ${index + 1}`}`}
                      type="number"
                      min={0}
                      value={row.stock}
                      onChange={(event) =>
                        updateRow(row.key, { stock: Math.max(0, Number(event.target.value) || 0) })
                      }
                      className="h-10 w-28 tabular-nums"
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      aria-label={`SKU for ${row.size || `size ${index + 1}`}`}
                      value={row.sku}
                      onChange={(event) => updateRow(row.key, { sku: event.target.value })}
                      className="h-10 tabular-nums"
                    />
                  </td>
                  <td className="py-1 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setRows((current) => current.filter((item) => item.key !== row.key))
                      }
                      aria-label={`Remove size ${row.size || index + 1}`}
                      className="grid size-10 cursor-pointer place-items-center hover:bg-mist"
                    >
                      <X className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() =>
            setRows((current) => [
              ...current,
              { size: "", stock: 0, sku: "", key: crypto.randomUUID() },
            ])
          }
        >
          <Plus /> Add size
        </Button>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <h2 className="type-label md:col-span-2">Publishing</h2>
        <Field label="Status" htmlFor="status" hint="Only active products appear in the shop">
          <Select
            {...describedBy("status", undefined, true)}
            name="status"
            defaultValue={values.status}
          >
            <option value="draft">Draft (hidden)</option>
            <option value="active">Active (on sale)</option>
            <option value="archived">Archived (hidden)</option>
          </Select>
        </Field>
        <Field
          label="Sort order"
          htmlFor="sortOrder"
          hint="Lower numbers show first under Featured"
        >
          <Input
            {...describedBy("sortOrder", undefined, true)}
            name="sortOrder"
            type="number"
            defaultValue={values.sortOrder}
            className="tabular-nums"
          />
        </Field>
        <Field
          label="URL"
          htmlFor="slug"
          error={errors.slug}
          hint={`rainbynurain.com/products/${slug || suggestedSlug || "…"}`}
          className="md:col-span-2"
        >
          <Input
            {...describedBy("slug", errors.slug, true)}
            name="slug"
            value={slug}
            placeholder={suggestedSlug}
            onChange={(event) => setSlug(event.target.value)}
            className="tabular-nums"
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 text-sm md:col-span-2">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={values.isFeatured}
            className="size-4 accent-ink"
          />
          Feature this product (shown first in the shop)
        </label>
      </section>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : values.id ? "Save changes" : "Create product"}
        </Button>
        {state.message && (
          <p
            role="status"
            className={state.status === "error" ? "text-sm text-signal" : "text-sm text-muted"}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
