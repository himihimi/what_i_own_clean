import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { readRecoveryLanding } from "@/lib/auth/recoveryLanding";
import { resolveNext } from "@/lib/auth/redirect";
import { authPaths } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends someone after they click an emailed link — both the
 * password-reset link and the sign-up confirmation.
 *
 * The link carries a one-time `code`, which is exchanged here for a session; the
 * cookies from the exchange are set on the redirect response, so the page it
 * forwards to is already signed in. Confirming an address therefore lands
 * straight on the welcome screen, which is the whole cycle.
 *
 * This route has no locale segment, because a redirect URL registered in the
 * Supabase dashboard is one fixed string for everybody.
 *
 * Links this app builds pass the locale in `next`, since the browser knows it
 * when the email is requested. For anything arriving without one, the language is
 * resolved here: the reader's stored preference if there is one, English
 * otherwise.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  /*
   * A dead link does not arrive as a code that fails to exchange — Supabase
   * reports it in the query instead, as `error=access_denied` with an
   * `error_code`. Reading only `code` therefore called every expired link
   * "invalid", which is a different thing to the person holding it.
   */
  const landing = readRecoveryLanding(Object.fromEntries(searchParams));

  const locale = await preferredLocale();
  const destination = resolveNext(
    searchParams.get("next"),
    locale,
    routing.locales,
  );

  /*
   * Where a failure goes depends on which link it was. A dead reset link belongs
   * on the screen that sends a new one; a dead confirmation link belongs on
   * sign-in, which is where that person needs to end up anyway.
   *
   * The language comes from the resolved destination rather than from the cookie,
   * so an explanation is in the same language the link was aiming at. Using the
   * cookie here meant a Chinese reset link could fail into an English page.
   * `resolveNext` guarantees the destination starts with a configured locale.
   */
  const [, destinationLocale] = destination.split("/");
  const failurePath = destination.endsWith(authPaths.updatePassword)
    ? `/${destinationLocale}${authPaths.forgotPassword}`
    : `/${destinationLocale}${authPaths.login}`;

  if (landing?.kind === "failed") {
    // Supabase already said what went wrong; pass its distinction on.
    return NextResponse.redirect(
      new URL(`${failurePath}?error=${landing.reason}`, origin),
    );
  }

  if (landing?.kind !== "exchange") {
    // No code and no error: a malformed link, or one already spent.
    return NextResponse.redirect(new URL(`${failurePath}?error=link`, origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(landing.code);

  if (error) {
    // Overwhelmingly this is an expired link — these codes are short-lived.
    return NextResponse.redirect(new URL(`${failurePath}?error=expired`, origin));
  }

  return NextResponse.redirect(new URL(destination, origin));
}

/**
 * The locale next-intl stored when the reader last chose one, falling back to the
 * default. Read from the cookie rather than `Accept-Language`, so an explicit
 * choice wins over whatever the browser advertises.
 */
async function preferredLocale(): Promise<string> {
  const stored = (await cookies()).get("NEXT_LOCALE")?.value;

  return stored && (routing.locales as readonly string[]).includes(stored)
    ? stored
    : routing.defaultLocale;
}
