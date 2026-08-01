"use client";

import { motion } from "motion/react";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";

import { localeLabels } from "@/i18n/localeLabels";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { press, transitions } from "@/lib/motion";

/**
 * A segmented pill, following demo.html's `.lang-switch`. Two locales fit in
 * one, where a dropdown would hide half the choice behind a tap.
 *
 * Navigation goes through next-intl's router with the current pathname, so the
 * switch preserves the page you are on rather than returning to the root.
 * `replace` keeps the back button meaning "the page before", not "the same page
 * in the other language".
 */
export function LocaleSwitch({ current }: { current: Locale }) {
  const t = useTranslations("localeSwitcher");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex items-center overflow-hidden rounded-full border border-border bg-surface"
    >
      {routing.locales.map((locale) => {
        const active = locale === current;

        return (
          <motion.button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={active}
            whileTap={press.row}
            transition={transitions.quick}
            onClick={() => router.replace(pathname, { locale })}
            className={`h-11 px-4 text-sm font-bold ${
              active ? "bg-accent text-on-accent" : "text-muted"
            }`}
          >
            {localeLabels[locale]}
          </motion.button>
        );
      })}
    </div>
  );
}
