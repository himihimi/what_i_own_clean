/**
 * Every auth-related path, and which of three groups it belongs to. One place,
 * so the guard, the redirects and the emailed links cannot disagree.
 *
 * | Group | Paths | Rule |
 * |---|---|---|
 * | `auth` | `/{locale}/auth/*` | for signed-out visitors; a signed-in one is sent to the app |
 * | `challenge` | `/challenge/*`, `/{locale}/challenge/*` | reached from an emailed link, so allowed either way |
 * | `protected` | everything else under `/{locale}` | needs a session |
 *
 * `challenge` exists as its own group because of one case: setting a new password
 * happens *while signed in* — the emailed link is what created the session — so
 * treating it as a signed-out screen would bounce the visitor to the app before
 * they could finish, and treating it as protected would be wrong for a link that
 * has expired.
 *
 * Paths are relative to the locale, which is how next-intl's navigation takes
 * them. The locale-less callback is the exception and is spelled out in full.
 */
export const authPaths = {
  login: "/auth/login",
  signup: "/auth/signup",
  forgotPassword: "/auth/forgot-password",
  updatePassword: "/challenge/update-password",
  /** Where a confirmed address lands. Reached from the emailed link, like its siblings. */
  confirmed: "/challenge/confirmed",
  /** No locale: a redirect URL registered with Supabase is one fixed string. */
  callback: "/challenge/callback",
  /** Where a signed-in visitor belongs. */
  home: "/welcome",
} as const;

export type RouteGroup = "auth" | "challenge" | "protected" | "public";

/** Readable without an account, and uninteresting to the guard. */
const publicPaths = ["/privacy", "/terms"];

/**
 * Classifies a full pathname, locale segment included.
 *
 * Anything that is not recognisably under a locale is `public`: the guard should
 * never redirect something it does not understand.
 */
export function classifyPath(
  pathname: string,
  locales: readonly string[],
): RouteGroup {
  if (pathname.startsWith("/challenge")) {
    return "challenge";
  }

  const [, locale, ...rest] = pathname.split("/");
  if (!locales.includes(locale)) {
    return "public";
  }

  const path = `/${rest.join("/")}`;

  if (path.startsWith("/auth/")) {
    return "auth";
  }

  if (path.startsWith("/challenge/")) {
    return "challenge";
  }

  if (publicPaths.some((p) => path === p || path.startsWith(`${p}/`))) {
    return "public";
  }

  return "protected";
}
