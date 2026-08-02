"use client";

import { useEffect } from "react";

import { routing } from "@/i18n/routing";
import { readRecoveryLanding } from "@/lib/auth/recoveryLanding";
import { resolveNext } from "@/lib/auth/redirect";
import { authPaths } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

/**
 * Turns what an emailed link left in the URL into a session, then moves on.
 *
 * **Why this runs in the browser.** The auth service hands the session back in
 * the URL *fragment*, and a fragment is never sent to a server — so no route
 * handler can read it. The alternative is a PKCE code, which the server could
 * read but could only redeem in the browser that requested the email; opening
 * the mail on a different device then fails, and that is the bug this replaces.
 *
 * The tokens are written by the app's own client, whose storage is cookies, so
 * the page this forwards to is already signed in when the server renders it.
 *
 * `location.replace`, not the router: a full navigation guarantees the server
 * sees the new cookies, and replacing the entry keeps a URL carrying tokens out
 * of the back button.
 */
export function CallbackHandler({ locale }: { locale: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);

    // The fragment is where a session or a failure arrives; the query is where
    // `next` lives, and where the auth service puts a failure it redirected.
    const landing = readRecoveryLanding({
      ...Object.fromEntries(url.searchParams),
      ...Object.fromEntries(new URLSearchParams(url.hash.replace(/^#/, ""))),
    });

    const destination = resolveNext(
      url.searchParams.get("next"),
      locale,
      routing.locales,
    );
    const [, destinationLocale] = destination.split("/");

    /*
     * A dead reset link belongs on the screen that sends a new one; a dead
     * confirmation belongs on sign-in, which is where that person needs to end
     * up and where an unconfirmed address is offered a fresh link. The link says
     * which it was; `next` is the fallback for one that does not.
     */
    const linkType = landing?.kind === "session" ? landing.type : undefined;
    const isRecovery = linkType
      ? linkType === "recovery"
      : destination.endsWith(authPaths.updatePassword);
    const failurePath = `/${destinationLocale}${
      isRecovery ? authPaths.forgotPassword : authPaths.login
    }`;

    const go = (path: string) => window.location.replace(path);

    void (async () => {
      if (!landing) {
        // Nothing in the URL at all: opened directly, or already spent.
        go(`${failurePath}?error=link`);
        return;
      }

      if (landing.kind === "failed") {
        go(`${failurePath}?error=${landing.reason}`);
        return;
      }

      const supabase = createClient();

      const { error } =
        landing.kind === "session"
          ? await supabase.auth.setSession({
              access_token: landing.accessToken,
              refresh_token: landing.refreshToken,
            })
          : await supabase.auth.exchangeCodeForSession(landing.code);

      if (error) {
        /*
         * Logged because the reader only ever sees one localised sentence, and
         * without the provider's own code there is no telling an expired link
         * from a rejected one. Never the token itself.
         */
        console.error(
          `[challenge/callback] ${landing.kind} failed — code=${error.code} status=${error.status}`,
        );
        go(`${failurePath}?error=expired`);
        return;
      }

      /*
       * A confirmation gets its own screen rather than being dropped into the
       * app: the address was confirmed by this request, and that is worth
       * saying. Anything else goes where the link was aiming.
       */
      go(
        linkType === "signup"
          ? `/${destinationLocale}${authPaths.confirmed}`
          : destination,
      );
    })();
  }, [locale]);

  return null;
}
