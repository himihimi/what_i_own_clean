import type { Locale } from "next-intl";

/**
 * Each language named in its own language, so it stays recognisable to someone
 * who cannot read the current one. Never translated, which is why these are a
 * module constant rather than message keys.
 *
 * Typed against the configured locales, so adding one to `routing` will not
 * compile until it is named here.
 */
export const localeLabels: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};
