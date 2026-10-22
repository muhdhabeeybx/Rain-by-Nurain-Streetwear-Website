import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNextPath } from "@/lib/redirects";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage({ searchParams }: PageProps<"/account/sign-in">) {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="type-display text-display-md">Sign in</h1>
        <p className="mt-3 mb-10 text-muted">
          See your orders and check out faster. Use the email address you order with.
        </p>
        <Suspense>
          {searchParams.then(({ next }) => (
            <SignInForm next={safeNextPath(next)} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
