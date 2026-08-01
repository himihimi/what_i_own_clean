import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/**
 * Resolves the messages for a request. Wired up in `next.config.ts` via the
 * next-intl plugin, and read by every `useTranslations` call on the server.
 *
 * An unknown locale falls back to the default rather than throwing: the proxy
 * should have prevented it, and a missing translation is not worth a 500.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
