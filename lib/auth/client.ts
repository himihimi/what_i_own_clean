import { createClient } from "@/lib/supabase/client";

import { authPaths } from "./routes";
import { retryAfterSeconds, toFailure, type AuthResult } from "./types";

/**
 * Sign-in, sign-up, sign-out and password reset, called from the browser.
 *
 * The session lands in cookies rather than localStorage — see
 * lib/supabase/client.ts — so a server component can read it on the next
 * request without the client handing anything over.
 */

/**
 * Where a confirmation link comes back to. Shared so sign-up and a resend cannot
 * drift apart — a resent link landing somewhere else would be its own bug.
 */
function confirmationRedirect(locale: string): string {
  const next = encodeURIComponent(`/${locale}${authPaths.home}`);
  return `${window.location.origin}${authPaths.callback}?next=${next}`;
}

/** Every failure path goes through here, so none of them can forget the wait. */
function failed(error: { code?: string; message?: string }): AuthResult {
  return {
    ok: false,
    reason: toFailure(error),
    retryAfterSeconds: retryAfterSeconds(error),
  };
}

export async function signIn(values: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(values);

  return error ? failed(error) : { ok: true };
}

export async function signUp(values: {
  name: string;
  email: string;
  password: string;
  locale: string;
}): Promise<AuthResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      // The name is the user's, not the app's, so it lives on the identity
      // rather than in a table of ours. It surfaces as
      // `user.user_metadata.name`.
      data: { name: values.name },
      /*
       * Where the confirmation link comes back to. Set here rather than left to
       * the project's Site URL, so confirming an address lands on the welcome
       * screen — already signed in, cycle complete — instead of the site root.
       *
       * The locale is included because the browser knows it at this moment. The
       * callback can still resolve one from the reader's stored preference, which
       * is what covers links it did not build — a URL configured in the Supabase
       * dashboard is one fixed string and cannot carry a language.
       */
      emailRedirectTo: confirmationRedirect(values.locale),
    },
  });

  if (error) {
    return failed(error);
  }

  /*
   * Two legitimate outcomes, and which one you get is a project setting rather
   * than anything about this request:
   *
   * - Confirmation off: a session comes back and the account is usable now.
   * - Confirmation on: a user comes back with no session, and a link has been
   *   emailed. Treating that as an error — which this used to do — told people
   *   something had gone wrong while their account was in fact created.
   *
   * Supabase deliberately returns this same shape for an address that already
   * has an account, so that sign-up cannot be used to discover who is
   * registered. The screen that follows must therefore not claim an account was
   * created, only that a link was sent if one was needed.
   */
  if (data.session) {
    return { ok: true };
  }

  return { ok: true, confirmationRequired: true };
}

/**
 * Sends the confirmation link again.
 *
 * A confirmation link expires, and once it has, telling someone to "open the link
 * we sent you" is useless — the link they have is dead and sign-in refuses them.
 * This is the way out of that corner, offered from the sign-in screen at the
 * moment it happens.
 */
export async function resendConfirmation(values: {
  email: string;
  locale: string;
}): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: values.email,
    options: { emailRedirectTo: confirmationRedirect(values.locale) },
  });

  return error ? failed(error) : { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Sends a reset link.
 *
 * `redirectTo` points at /challenge/callback — a fixed, allow-listed URL that cannot
 * vary per locale, so the language rides along in `next` and the callback
 * forwards there once the link has been exchanged for a session.
 *
 * Supabase answers the same way whether or not the address has an account, and
 * so must the UI: reporting "no such account" here would turn this form into a
 * way to discover who has one. The only failures worth surfacing are transport
 * and rate limiting.
 */
export async function requestPasswordReset(values: {
  email: string;
  locale: string;
}): Promise<AuthResult> {
  const supabase = createClient();
  const next = `/${values.locale}${authPaths.updatePassword}`;

  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${window.location.origin}${authPaths.callback}?next=${encodeURIComponent(next)}`,
  });

  return error ? failed(error) : { ok: true };
}

/**
 * Sets a new password for whoever the current session belongs to.
 *
 * Reached from a reset link, where the session came from the emailed token — so
 * possession of that link is the authorisation. Also usable later from a
 * settings screen by an already signed-in user.
 */
export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  return error ? failed(error) : { ok: true };
}
