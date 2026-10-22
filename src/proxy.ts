import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await updateSession(request);

  // Optimistic gate only: data is protected by row level security and
  // re-checked on the server for every page and action.
  const { pathname } = request.nextUrl;
  const needsAccount =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/account") && pathname !== "/account/sign-in");
  if (needsAccount && !isSignedIn) {
    const signIn = new URL("/account/sign-in", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  return response;
}

export const config = {
  // Only routes that read the session. Catalogue pages stay fully static.
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*", "/orders/:path*"],
};
