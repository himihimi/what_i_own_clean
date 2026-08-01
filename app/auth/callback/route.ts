import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { isSafeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends someone after they click an emailed link.
 *
 * The link carries a one-time `code`, which is exchanged here for a real
 * session; the cookies that come out of the exchange are set on the redirect
 * response, so the page we forward to is already signed in.
 *
 * This route has no locale segment, because the redirect URL registered with
 * Supabase cannot vary per language. The locale travels in `next` instead, and
 * is validated below rather than trusted: `next` arrives from a URL, and an
 * unchecked redirect target is an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const safeNext = isSafeNext(next, routing.locales)
    ? next
    : `/${routing.defaultLocale}/update-password`;

  if (!code) {
    // No code means a malformed or already-used link. Send them somewhere they
    // can act rather than showing an error page with no way forward.
    return NextResponse.redirect(
      new URL(`/${routing.defaultLocale}/forgot-password?error=link`, origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Overwhelmingly this is an expired link — recovery codes are short-lived.
    return NextResponse.redirect(
      new URL(`/${routing.defaultLocale}/forgot-password?error=expired`, origin),
    );
  }

  return NextResponse.redirect(new URL(safeNext, origin));
}
