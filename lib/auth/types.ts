/** Why a sign-in or sign-up attempt failed, in terms the UI can translate. */
export type AuthFailure =
  | "invalid-credentials"
  | "email-taken"
  | "weak-password"
  | "rate-limited"
  | "unknown";

export type AuthResult =
  | {
      ok: true;
      /**
       * Sign-up succeeded but returned no session, because the project requires
       * the address to be confirmed first. The caller shows "check your inbox"
       * rather than navigating into the app.
       */
      confirmationRequired?: boolean;
    }
  | {
      ok: false;
      reason: AuthFailure;
      /** Present when the provider says how long to wait. */
      retryAfterSeconds?: number;
    };

/**
 * Supabase error codes mapped to our reasons. Anything unrecognised becomes
 * `unknown` rather than being shown raw: provider text is not localised, is not
 * written for end users, and occasionally leaks detail about which accounts
 * exist.
 */
const codes: Record<string, AuthFailure> = {
  invalid_credentials: "invalid-credentials",
  user_already_exists: "email-taken",
  email_exists: "email-taken",
  weak_password: "weak-password",
  over_request_rate_limit: "rate-limited",
  over_email_send_rate_limit: "rate-limited",
};

export function toFailure(error: { code?: string } | null): AuthFailure {
  return (error?.code && codes[error.code]) || "unknown";
}

/**
 * Digs the wait out of a rate-limit message — "you can only request this after
 * 44 seconds" — so the UI can name a real number instead of saying "a while",
 * which the copy rules in docs/design.md rule out.
 *
 * Parsing prose is brittle by nature, so this is strictly a nicety: no match
 * simply means the generic message is shown.
 */
export function retryAfterSeconds(
  error: { message?: string } | null,
): number | undefined {
  const match = error?.message?.match(/(\d+)\s*second/i);
  return match ? Number(match[1]) : undefined;
}
