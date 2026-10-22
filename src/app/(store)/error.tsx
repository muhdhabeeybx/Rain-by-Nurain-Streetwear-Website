"use client";

import { Button } from "@/components/ui/button";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page py-24 text-center md:py-32">
      <h1 className="type-display text-display-md">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
