import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { isAuthenticated } from "@/lib/auth/server";

/**
 * The entry point decides where a visit goes: the welcome screen when signed in,
 * the login screen when not. It renders nothing itself.
 *
 * `isAuthenticated` reads the Supabase session from the request's cookies, so
 * this route is dynamic. That is correct: the answer depends on who is asking.
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
