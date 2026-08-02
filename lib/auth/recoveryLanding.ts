import { authPaths } from "./routes";

/**
 * Reads what an emailed link left in the query string.
 *
 * Three shapes, in the order they are looked for:
 *
 * - `token_hash` and `type` — every link this app sends. The email templates
 *   append them to the callback URL, so the link comes straight here with no
 *   detour through the auth service, and the token is verified server-side.
 * - `code` — a PKCE code from a link sent before that change. Kept so links
 *   already in someone's inbox still work.
 * - `error` / `error_code` — how a dead link is reported when the auth service
 *   handled it, which is the case for anything built from `{{ .ConfirmationURL }}`.
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
/**
 * The link types this app sends, and the only ones the callback will verify.
 * Anything else in `type` is treated as a malformed link rather than passed on
 * to the auth service.
 */
const linkTypes = ["signup", "recovery"] as const;

export type LinkType = (typeof linkTypes)[number];

export type RecoveryLanding =
  /** A one-time token to verify. What every link this app sends now carries. */
  | { kind: "verify"; tokenHash: string; type: LinkType }
  /** A PKCE code to exchange. Only links sent before the switch to `token_hash`. */
  | { kind: "exchange"; code: string }
  | { kind: "failed"; reason: "expired" | "link" }
  | null;

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function asLinkType(value: string | undefined): LinkType | undefined {
  return linkTypes.find((type) => type === value);
}

export function readRecoveryLanding(params: Params): RecoveryLanding {
  const tokenHash = first(params.token_hash);
  if (tokenHash) {
    const type = asLinkType(first(params.type));

    return type
      ? { kind: "verify", tokenHash, type }
      : { kind: "failed", reason: "link" };
  }

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
