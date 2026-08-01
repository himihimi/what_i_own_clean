/**
 * Where to send someone after an emailed link has been exchanged for a session.
 *
 * The destination arrives from a URL that anyone can craft, and an unchecked
 * redirect target is an open redirect — a link that lands someone on a convincing
 * copy of this app. Everything here is validated rather than trusted, and
 * anything suspect falls back to a known path.
 *
 * Locales are passed in rather than imported so these stay pure functions with
 * no module graph, which is what makes them testable on their own.
 */

/**
 * Rejects anything that is not a same-site path.
 *
 * `//host` and `/\host` start with a slash but leave the site: browsers read the
 * first as protocol-relative, and some clients normalise the backslash in the
 * second to a slash.
 */
export function isSameSitePath(next: string | null | undefined): next is string {
  if (!next || !next.startsWith("/")) {
    return false;
  }

  return !next.startsWith("//") && !next.startsWith("/\\");
}

/** A same-site path whose first segment is a configured locale. */
export function isSafeNext(
  next: string | null | undefined,
  locales: readonly string[],
): next is string {
  if (!isSameSitePath(next)) {
    return false;
  }

  const [, locale] = next.split("/");
  return locales.includes(locale);
}

/**
 * Resolves the path to land on, in the reader's language.
 *
 * Links this app builds already carry the locale — the browser knows it when the
 * email is requested — so those are used as they are. The `locale` argument is
 * for links that arrive without one: a redirect URL registered in the Supabase
 * dashboard is one fixed string for everybody and cannot contain `/en` or `/zh`,
 * so the language has to come from the reader's stored preference instead.
 *
 * | `next` | Result |
 * |---|---|
 * | `/en/welcome` | used as-is |
 * | `/welcome` | prefixed with the resolved locale |
 * | missing, or not a same-site path | `fallback` under the resolved locale |
 */
export function resolveNext(
  next: string | null | undefined,
  locale: string,
  locales: readonly string[],
  fallback = "/welcome",
): string {
  if (!isSameSitePath(next)) {
    return `/${locale}${fallback}`;
  }

  const [, first] = next.split("/");

  return locales.includes(first) ? next : `/${locale}${next}`;
}
