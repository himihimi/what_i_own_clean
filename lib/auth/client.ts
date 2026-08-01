import { createClient } from "@/lib/supabase/client";

import { toFailure, type AuthResult } from "./types";

/**
 * Sign-in, sign-up and sign-out, called from the browser.
 *
 * The session lands in cookies rather than localStorage — see
 * lib/supabase/client.ts — so a server component can read it on the next
 * request without the client handing anything over.
 */

export async function signIn(values: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(values);

  return error ? { ok: false, reason: toFailure(error) } : { ok: true };
}

export async function signUp(values: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    // The name is the user's, not the app's, so it lives on the identity rather
    // than in a table of ours. It surfaces as `user.user_metadata.name`.
    options: { data: { name: values.name } },
  });

  if (error) {
    return { ok: false, reason: toFailure(error) };
  }

  /*
   * With email confirmation off, sign-up returns a session and the user is in.
   * If confirmation is ever turned on, Supabase returns a user with no session
   * and — to avoid disclosing which addresses are registered — returns the same
   * shape for an address that already exists. Treating a missing session as
   * "email taken" would therefore be wrong; that case needs its own
   * "check your inbox" screen, which does not exist yet.
   */
  return data.session ? { ok: true } : { ok: false, reason: "unknown" };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Sends a reset link.
 *
 * `redirectTo` points at /auth/callback — a fixed, allow-listed URL that cannot
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
  const next = `/${values.locale}/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
  });

  return error ? { ok: false, reason: toFailure(error) } : { ok: true };
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

  return error ? { ok: false, reason: toFailure(error) } : { ok: true };
}
