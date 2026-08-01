import { notFound } from "next/navigation";
import { type Locale, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Each language is listed in its own language, so it stays recognisable to
 * someone who cannot read the current one. Typed against the configured
 * locales, so adding one to `routing` will not compile until it is named here.
 */
const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Repeated per statically rendered route, not just in the layout.
  setRequestLocale(locale);

  const t = await getTranslations("app");
  const tSwitcher = await getTranslations("localeSwitcher");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{t("name")}</h1>
      <p className="text-sm text-muted">{t("tagline")}</p>

      <nav aria-label={tSwitcher("label")} className="flex gap-4 text-sm">
        {routing.locales.map((target) => (
          <Link
            key={target}
            href="/"
            locale={target}
            aria-current={target === locale ? "true" : undefined}
            className="underline underline-offset-4 aria-[current]:font-semibold aria-[current]:no-underline"
          >
            {localeNames[target]}
          </Link>
        ))}
      </nav>
    </main>
  );
}
