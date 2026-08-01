import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { authPaths } from "@/lib/auth/routes";

/**
 * The locale root renders nothing; it only forwards into the app.
 *
 * Everything that used to be decided here now happens in `proxy.ts` — the auth
 * guard, and catching emailed links that land on the site root — because both have
 * to run before a page does. A signed-out visitor is therefore already gone by the
 * time this would render, which leaves one job.
 */
export default async function LocaleIndex({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  redirect({ href: authPaths.home, locale });
}
