import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { getCategoryOptions } from "../categories";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="type-label text-muted hover:text-ink">
        ← Products
      </Link>
      <h1 className="mt-4 type-display text-display-md">New product</h1>
      <p className="mt-2 text-sm text-muted">Save it first, then add photos.</p>
      <div className="mt-10 max-w-3xl">
        <Suspense fallback={<div aria-hidden className="h-96 animate-pulse bg-mist" />}>
          <NewProductForm />
        </Suspense>
      </div>
    </>
  );
}

async function NewProductForm() {
  const { supabase } = await requireAdmin();
  const categories = await getCategoryOptions(supabase);
  return (
    <ProductForm
      categories={categories}
      values={{
        name: "",
        slug: "",
        categoryId: "",
        status: "draft",
        isFeatured: false,
        price: "",
        compareAtPrice: "",
        colorName: "",
        colorHex: "",
        styleCode: "",
        description: "",
        details: "",
        sortOrder: 0,
        variants: [],
      }}
    />
  );
}
