import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { authPaths } from "@/lib/auth/routes";

/**
 * The locale-less callback, kept only to forward to the real one at
 * `/{locale}/challenge/callback`.
 *
 * Links this app builds carry the locale, because the browser knows it when the
 * email is requested. This is for the ones that cannot: a redirect URL typed
 * into the Supabase dashboard is a single fixed string, and a link sent before
 * the callback moved under the locale is another.
 *
 * A redirect keeps the URL fragment — the browser reapplies it to the new
 * location — which matters, because for these links the fragment is the session.
 * The query is carried across explicitly.
 */
export async function GET(request: NextRequest) {
  const { search, origin } = request.nextUrl;
  const locale = await preferredLocale();

  return NextResponse.redirect(
    new URL(`/${locale}${authPaths.callback}${search}`, origin),
  );
}

/**
 * The locale next-intl stored when the reader last chose one, falling back to
 * the default. Read from the cookie rather than `Accept-Language`, so an
 * explicit choice wins over whatever the browser advertises.
 */
async function preferredLocale(): Promise<string> {
  const stored = (await cookies()).get("NEXT_LOCALE")?.value;

  return stored && (routing.locales as readonly string[]).includes(stored)
    ? stored
    : routing.defaultLocale;
}
