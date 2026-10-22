import Link from "next/link";
import { Monogram } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <Monogram title="" className="h-12 w-auto" />
      <h1 className="mt-10 type-display text-display-lg">Not found</h1>
      <p className="mt-4 max-w-sm text-muted">
        This page doesn&apos;t exist, or the piece you&apos;re looking for has moved on.
      </p>
      <div className="mt-10 flex gap-3">
        <Button asChild>
          <Link href="/shop">Shop the collection</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
