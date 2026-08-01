import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { supabasePublishableKey, supabaseUrl } from "./lib/supabase/env";

/**
 * Next.js 16 renamed Middleware to Proxy; the file must be called `proxy.ts` at
 * the project root. next-intl still ships its handler as `next-intl/middleware` —
 * same function, older name.
 *
 * Two jobs run here, and the order matters.
 *
 * 1. next-intl negotiates a locale from the URL, its cookie, and Accept-Language,
 *    and may answer with a redirect (`/` → `/en`).
 * 2. Supabase refreshes an expiring session.
 *
 * The refreshed auth cookies have to be written onto **next-intl's** response,
 * not a fresh one, or they are dropped whenever the locale redirect fires — which
 * is every visit to `/`. They are also written back onto the request, so server
 * components rendering this same pass see the new tokens rather than the expiring
 * ones.
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
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Everything except API routes, Next internals, and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
