import { defineRouting } from "next-intl/routing";

/**
 * The single source of truth for which locales exist. Adding one here is
 * enough for the proxy, the locale switcher, and static generation to pick
 * it up; only a matching file in `messages/` is required alongside it.
 */
export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
});
