import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { isAuthenticated } from "@/lib/auth";

/**
 * The entry point decides where a visit goes: the welcome screen when signed in,
 * the login screen when not. It renders nothing itself.
 *
 * `isAuthenticated` is stubbed to false, so everything lands on login for now.
 * Once it reads a real session this route stops being statically prerenderable,
 * which is expected — the answer depends on the request.
 *
 * The redirect comes from next-intl's navigation, so the locale prefix is kept
 * and a visitor on /zh does not get bounced to the English login.
 */
export default async function LocaleIndex({
  params,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  redirect({
    href: (await isAuthenticated()) ? "/welcome" : "/login",
    locale,
  });
}
