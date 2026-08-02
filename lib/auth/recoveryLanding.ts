import { authPaths } from "./routes";

/**
 * Reads what an emailed link left behind — in the query string, or in the URL
 * fragment, which only the browser can see.
 *
 * Three shapes, in the order they are looked for:
 *
 * - `access_token` and `refresh_token` — a session, handed over whole. This is
 *   what the auth service returns for a link that was requested without a PKCE
 *   challenge, and it arrives in the fragment.
 * - `code` — a PKCE code, from a link requested with one. Only redeemable in the
 *   browser that asked for the email, which is why the app no longer sends them.
 * - `error` / `error_code` — how a dead link is reported. Also in the fragment
 *   for these links, and in the query for anything the auth service redirected.
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
  /** A whole session, from the fragment. What every link this app sends carries. */
  | {
      kind: "session";
      accessToken: string;
      refreshToken: string;
      /** Which link it was, so the destination can differ. Absent on old links. */
      type?: LinkType;
    }
  /** A PKCE code to exchange, redeemable only in the browser that asked. */
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
  const accessToken = first(params.access_token);
  const refreshToken = first(params.refresh_token);
  if (accessToken && refreshToken) {
    return {
      kind: "session",
      accessToken,
      refreshToken,
      type: asLinkType(first(params.type)),
    };
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

/** The callback owns redemption, so a stray code is forwarded there. */
export function callbackUrl(code: string, locale: string): string {
  const next = encodeURIComponent(`/${locale}${authPaths.updatePassword}`);
  return `/${locale}${authPaths.callback}?code=${encodeURIComponent(code)}&next=${next}`;
}
