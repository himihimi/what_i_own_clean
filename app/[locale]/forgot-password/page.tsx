import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthScreen } from "@/components/AuthScreen";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: PageProps<"/[locale]/forgot-password">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("forgotPassword");
  // Set by /auth/callback when a link is expired or malformed, so the person
  // lands on the one screen that can send them a fresh one.
  const { error } = await searchParams;

  return (
    <AuthScreen
      locale={locale}
      title={t("title")}
      footer={
        <Link
          href="/login"
          className="font-semibold text-accent-ink underline underline-offset-4"
        >
          {t("backToLogin")}
        </Link>
      }
    >
      <ForgotPasswordForm linkError={typeof error === "string" ? error : undefined} />
    </AuthScreen>
  );
}
