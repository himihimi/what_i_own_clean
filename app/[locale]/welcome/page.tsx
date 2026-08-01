import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppShell } from "@/components/app-shell/AppShell";
import { TopBar } from "@/components/app-shell/TopBar";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { authPaths } from "@/lib/auth/routes";
import { currentUser } from "@/lib/auth/server";

/**
 * The first screen after signing in, and the first to use the app shell.
 *
 * Still a placeholder in content — the real screen is the library grid at M2 —
 * but the frame around it is real: sticky top bar, scrolling body, fixed tab bar.
 *
 * It checks the session itself rather than trusting the redirect at `/[locale]`:
 * this URL can be typed directly, and a screen that greets someone by name should
 * not render without knowing whose.
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
    return redirect({ href: authPaths.login, locale });
  }

  const t = await getTranslations("account");
  const tApp = await getTranslations("app");
  const name = user.user_metadata?.name;

  return (
    <AppShell
      header={
        <TopBar
          title={tApp("name")}
          mark={tApp("mark")}
          // Real controls rather than the mockup's search and profile buttons,
          // which have no screens behind them yet.
          actions={
            <>
              <ThemeToggle />
              <LocaleSwitch current={locale} />
            </>
          }
        />
      }
    >
      <div className="flex flex-col items-start gap-2 pt-6">
        <h2 className="text-xl font-bold tracking-tight text-text">
          {name ? t("greeting", { name }) : t("greetingNoName")}
        </h2>
        <p className="text-sm text-muted">{user.email}</p>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted">
        {t("comingSoon")}
      </p>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </AppShell>
  );
}
