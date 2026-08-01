import type { routing } from "@/i18n/routing";
import type messages from "@/messages/en.json";

/**
 * Makes `Locale` a union of the configured locales and typechecks translation
 * keys against the English catalogue, so a typo in `t("app.nam")` or a key
 * missing from `en.json` is a compile error rather than a runtime fallback.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
