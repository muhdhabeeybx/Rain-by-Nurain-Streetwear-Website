import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="container-page py-24 text-center md:py-32">
      <h1 className="type-display text-display-md">Order not found</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        Use the link in your confirmation email, or sign in with the email address you ordered with
        to see all your orders.
      </p>
      <Button asChild className="mt-8">
        <Link href="/account">Go to your account</Link>
      </Button>
    </div>
  );
}
