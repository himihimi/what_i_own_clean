import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { callbackUrl, readRecoveryLanding } from "./lib/auth/recoveryLanding";
import { authPaths, classifyPath } from "./lib/auth/routes";
import { supabasePublishableKey, supabaseUrl } from "./lib/supabase/env";

/**
 * Next.js 16 renamed Middleware to Proxy; the file must be called `proxy.ts` at
 * the project root. next-intl still ships its handler as `next-intl/middleware` —
 * same function, older name.
 *
 * Three jobs, in this order:
 *
 * 1. next-intl resolves the locale, and may answer with a redirect (`/` → `/en`).
 * 2. Supabase refreshes an expiring session. The refreshed cookies must be
 *    written onto **next-intl's** response, not a fresh one, or they are dropped
 *    on every locale redirect — which is every visit to the root.
 * 3. The one auth guard: signed-out visitors are kept out of the app, and
 *    signed-in ones are kept off the sign-in screens.
 *
 * The guard lives here because the session is already being checked for the
 * refresh, so it costs nothing extra, and because one rule in one place is easier
 * to reason about than a check at the top of every page. It is a redirect for the
 * visitor's benefit, **not** the security boundary — that is row-level security in
 * Postgres, which does not care what this file decides.
 */
const handleI18n = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = handleI18n(request);

  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // `getUser`, not `getSession`: only this revalidates the token with the auth
  // server, and revalidating is the entire point of doing it here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If next-intl is already redirecting, let it: the destination gets guarded on
  // the next request, and rewriting a redirect mid-flight loses its cookies.
  if (response.headers.has("location")) {
    return response;
  }

  const { pathname, searchParams } = request.nextUrl;
  const group = classifyPath(pathname, routing.locales);
  const locale = localeOf(pathname);

  /*
   * An emailed link whose `redirect_to` was not allow-listed lands on the Site
   * URL instead of the callback, carrying its one-time `code` in the query. That
   * has to be caught before the guard runs: the visitor has no session yet, so the
   * guard would send them to sign-in and the code would be spent for nothing.
   *
   * Only the locale root and the challenge routes are treated as landing spots.
   * Checking everywhere loops: the auth screens are where a dead link's `?error`
   * is *displayed*, so re-reading it there sends the request straight back to
   * itself.
   */
  const isLandingSpot = pathname === `/${locale}` || group === "challenge";
  const landing = isLandingSpot
    ? readRecoveryLanding(Object.fromEntries(searchParams))
    : null;

  if (landing?.kind === "exchange") {
    return redirectTo(callbackUrl(landing.code, locale), request, response);
  }

  if (landing?.kind === "failed") {
    return redirectTo(
      `/${locale}${authPaths.login}?error=${landing.reason}`,
      request,
      response,
    );
  }

  if (group === "protected" && !user) {
    return redirectTo(`/${locale}${authPaths.login}`, request, response);
  }

  if (group === "auth" && user) {
    return redirectTo(`/${locale}${authPaths.home}`, request, response);
  }

  return response;
}

/** Keeps any refreshed auth cookies on the redirect we answer with. */
function redirectTo(path: string, request: NextRequest, carrying: NextResponse) {
  const redirect = NextResponse.redirect(new URL(path, request.nextUrl.origin));

  for (const cookie of carrying.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }

  return redirect;
}

function localeOf(pathname: string): string {
  const [, first] = pathname.split("/");

  return (routing.locales as readonly string[]).includes(first)
    ? first
    : routing.defaultLocale;
}

export const config = {
  /*
   * Everything except API routes, Next internals, and files with an extension.
   *
   * `challenge` is excluded so /challenge/callback runs untouched: it has no
   * locale to negotiate, it establishes the session itself, and it must not be
   * guarded — the whole point of that request is that there is no session yet.
   */
  matcher: "/((?!api|challenge|_next|_vercel|.*\\..*).*)",
};
