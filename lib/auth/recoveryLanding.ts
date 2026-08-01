import { authPaths } from "./routes";

/**
 * Reads what an emailed link left in the query string.
 *
 * Links do not always arrive at `/challenge/callback`. If `redirect_to` is not on the
 * project's allow-list, Supabase falls back to the Site URL and the one-time
 * `code` lands on the site root instead — where, until this existed, it was
 * silently dropped and the visitor got the login screen with no explanation.
 *
 * Supabase reports a spent or expired link as query parameters too, so the same
 * read covers both outcomes.
 *
 * A pure function taking already-resolved params: no imports, so it can be
 * tested on its own, and it works from any page that receives search params.
 */
export type RecoveryLanding =
  | { kind: "exchange"; code: string }
  | { kind: "failed"; reason: "expired" | "link" }
  | null;

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function readRecoveryLanding(params: Params): RecoveryLanding {
  const code = first(params.code);
  if (code) {
    return { kind: "exchange", code };
  }

  const errorCode = first(params.error_code);
  const error = first(params.error) ?? errorCode;

  if (error) {
    // `otp_expired` is what a link past its hour reports; anything else is
    // malformed or already spent, which reads differently to the person.
    return {
      kind: "failed",
      reason: errorCode?.includes("expired") ? "expired" : "link",
    };
  }

  return null;
}

/** The callback owns the exchange, so a stray code is forwarded there. */
export function callbackUrl(code: string, locale: string): string {
  const next = encodeURIComponent(`/${locale}${authPaths.updatePassword}`);
  return `${authPaths.callback}?code=${encodeURIComponent(code)}&next=${next}`;
}
