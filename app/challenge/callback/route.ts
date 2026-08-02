import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { readRecoveryLanding } from "@/lib/auth/recoveryLanding";
import { resolveNext } from "@/lib/auth/redirect";
import { authPaths } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Where an emailed link lands — both the password-reset link and the sign-up
 * confirmation.
 *
 * The link carries a one-time `token_hash`, which is verified here and turned
 * into a session; the cookies from that are set on the redirect response, so the
 * page it forwards to is already signed in.
 *
 * **The token is verified here rather than by the auth service.** A link built
 * from `{{ .ConfirmationURL }}` goes to `/auth/v1/verify`, which redirects back
 * with a PKCE `code` — and that code can only be redeemed by the browser that
 * requested the email, because exchanging it needs a verifier stored in that
 * browser's cookies. Someone who signs up on a laptop and opens the mail on
 * their phone gets a link that cannot be redeemed, reported to them as an
 * expired one. Verifying `token_hash` needs nothing but the token, so a link
 * works wherever it is opened. It also removes a redirect: the link points
 * straight here.
 *
 * The templates that produce those links are in `supabase/templates/`, and the
 * hosted project needs the same two — see docs/architecture.md.
 *
 * This route has no locale segment, because a redirect URL registered in the
 * Supabase dashboard is one fixed string for everybody. Links this app builds
 * pass the locale in `next`, since the browser knows it when the email is
 * requested. For anything arriving without one, the language is resolved here:
 * the reader's stored preference if there is one, English otherwise.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

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
   * sign-in, which is where that person needs to end up anyway — and where a
   * still-unconfirmed address is offered a fresh link.
   *
   * The language comes from the resolved destination rather than from the cookie,
   * so an explanation is in the same language the link was aiming at. Using the
   * cookie here meant a Chinese reset link could fail into an English page.
   * `resolveNext` guarantees the destination starts with a configured locale.
   */
  const [, destinationLocale] = destination.split("/");
  const isRecovery =
    landing?.kind === "verify"
      ? landing.type === "recovery"
      : destination.endsWith(authPaths.updatePassword);
  const failurePath = isRecovery
    ? `/${destinationLocale}${authPaths.forgotPassword}`
    : `/${destinationLocale}${authPaths.login}`;

  const failWith = (reason: "expired" | "link") =>
    NextResponse.redirect(new URL(`${failurePath}?error=${reason}`, origin));

  if (landing?.kind === "failed") {
    // Supabase already said what went wrong; pass its distinction on.
    return failWith(landing.reason);
  }

  if (!landing) {
    // No token, no code and no error: a malformed link, or one already spent.
    return failWith("link");
  }

  const supabase = await createClient();

  if (landing.kind === "verify") {
    const { error } = await supabase.auth.verifyOtp({
      type: landing.type,
      token_hash: landing.tokenHash,
    });

    if (error) {
      /*
       * Logged because this is the one step with no other witness: the reader
       * sees a sentence, and without the provider's own code there is no way to
       * tell an expired token from a rejected one. Never the token itself.
       *
       * Interpolated rather than passed as a second argument, because a
       * structured logger between here and the reader can drop that argument —
       * Next's dev log renders it as `{}`, and a log nobody can read is no log.
       */
      console.error(
        `[challenge/callback] verifyOtp failed — type=${landing.type} code=${error.code} status=${error.status}`,
      );

      return failWith(error.code?.includes("expired") ? "expired" : "link");
    }

    /*
     * A confirmation gets its own screen rather than being dropped into the app.
     * The address was confirmed by this request whether or not the reader is now
     * signed in, and saying so is worth a screen — see docs/design.md §11.
     */
    return NextResponse.redirect(
      new URL(
        landing.type === "signup"
          ? `/${destinationLocale}${authPaths.confirmed}`
          : destination,
        origin,
      ),
    );
  }

  /*
   * A PKCE code, so a link sent before the templates changed. Kept working for
   * as long as one can still be in an inbox; this branch can go once they have
   * all expired.
   */
  const { error } = await supabase.auth.exchangeCodeForSession(landing.code);

  if (error) {
    console.error(
      `[challenge/callback] code exchange failed — code=${error.code} status=${error.status}`,
    );

    return failWith("expired");
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
