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
