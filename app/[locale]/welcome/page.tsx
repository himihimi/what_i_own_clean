import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LocaleSwitch } from "@/components/LocaleSwitch";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { currentUser } from "@/lib/auth/server";

/**
 * Where a signed-in visit lands. Still a placeholder — the real screen is the
 * library grid at M2 — but it reads the session, so it doubles as proof that
 * auth works end to end.
 *
 * It checks for itself rather than trusting the redirect in `/[locale]`: this
 * URL can be typed directly, and a screen that shows someone's name should
 * never render without knowing whose.
 */
export default async function WelcomePage({
  params,
}: PageProps<"/[locale]/welcome">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const user = await currentUser();
  if (!user) {
    // Returned, not just called: that is what tells TypeScript this branch
    // cannot fall through, so `user` is non-null below.
    return redirect({ href: "/login", locale });
  }

  const t = await getTranslations("account");
  const name = user.user_metadata?.name;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LocaleSwitch current={locale} />
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {name ? t("greeting", { name }) : t("greetingNoName")}
      </h1>
      <p className="text-sm text-muted">{user.email}</p>

      <SignOutButton />
    </main>
  );
}
