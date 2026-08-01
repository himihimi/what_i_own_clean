/** Why a sign-in or sign-up attempt failed, in terms the UI can translate. */
export type AuthFailure =
  | "invalid-credentials"
  | "email-taken"
  | "weak-password"
  | "rate-limited"
  | "unknown";

export type AuthResult = { ok: true } | { ok: false; reason: AuthFailure };

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
