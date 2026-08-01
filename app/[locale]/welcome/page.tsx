import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LocaleSwitch } from "@/components/LocaleSwitch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { routing } from "@/i18n/routing";

/**
 * Where a signed-in visit lands, reached by the redirect in `/[locale]`. Still a
 * placeholder — the real screen is the library grid at M2.
 */
export default async function WelcomePage({
  params,
}: PageProps<"/[locale]/welcome">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Repeated per statically rendered route, not just in the layout.
  setRequestLocale(locale);

  const t = await getTranslations("app");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{t("name")}</h1>
      <p className="text-sm text-muted">{t("tagline")}</p>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LocaleSwitch current={locale} />
      </div>
    </main>
  );
}
