/**
 * Whether a `next` parameter is safe to redirect to.
 *
 * It arrives from a URL that anyone can craft, and an unchecked redirect target
 * is an open redirect — a password-reset link that lands someone on a convincing
 * copy of this app. Only a same-site path whose first segment is a configured
 * locale is accepted; everything else falls back to a known destination.
 *
 * Locales are passed in rather than imported so this stays a pure function with
 * no module graph, which is what makes it testable on its own.
 *
 * Rejected explicitly:
 * - `//host` — starts with a slash, but browsers read it as protocol-relative.
 * - `/\host` — the same trick; some clients normalise the backslash to a slash.
 */
export function isSafeNext(
  next: string | null | undefined,
  locales: readonly string[],
): next is string {
  if (!next || !next.startsWith("/")) {
    return false;
  }

  if (next.startsWith("//") || next.startsWith("/\\")) {
    return false;
  }

  const [, locale] = next.split("/");
  return locales.includes(locale);
}
