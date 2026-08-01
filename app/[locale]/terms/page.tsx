import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { LegalScreen } from "@/components/LegalScreen";
import { terms } from "@/content/legal/terms";
import { routing } from "@/i18n/routing";

/** Prerendered per locale: the text is the same for everyone. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return { title: terms[resolved].title };
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return <LegalScreen document={terms[locale]} />;
}
