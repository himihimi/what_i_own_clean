"use client";

import { Check, Languages } from "lucide-react";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localeLabels } from "@/i18n/localeLabels";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * A dropdown rather than the segmented pill it replaced, so the trigger is the
 * same round icon button as the theme toggle and the two read as one cluster.
 * The pill also grew with every locale added; a menu does not.
 *
 * Navigation goes through next-intl's router with the current pathname, so the
 * page is preserved rather than returning to the root. `replace` keeps the back
 * button meaning "the page before", not "this page in the other language".
 */
export function LocaleSwitch({ current }: { current: Locale }) {
  const t = useTranslations("localeSwitcher");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t("label")}>
          <Languages size={18} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            lang={locale}
            onSelect={() => router.replace(pathname, { locale })}
            className="justify-between"
          >
            {localeLabels[locale]}
            {locale === current && <Check size={16} aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
