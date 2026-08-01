/**
 * Authentication, stubbed.
 *
 * Everything that asks about auth goes through this one module, so wiring
 * Supabase at M1 means replacing these three functions rather than hunting for
 * call sites. Email and password only — no third-party identity provider is
 * involved. See docs/architecture.md.
 */

/** What a sign-in or sign-up attempt can come back with. */
export type AuthResult =
  | { ok: true }
  | { ok: false; reason: "not-implemented" | "invalid-credentials" | "email-taken" | "unknown" };

/**
 * Returns false for now, so every visit lands on the login screen. Becomes a
 * session read from a Supabase client built on the caller's JWT.
 */
export async function isAuthenticated(): Promise<boolean> {
  return false;
}

/** Becomes `supabase.auth.signInWithPassword`. */
export async function signIn(_values: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  return { ok: false, reason: "not-implemented" };
}

/** Becomes `supabase.auth.signUp`, with the name going to user metadata. */
export async function signUp(_values: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  return { ok: false, reason: "not-implemented" };
}
