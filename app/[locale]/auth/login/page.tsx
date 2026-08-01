import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthScreen } from "@/components/AuthScreen";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/auth/login">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("login");
  // Set by /challenge/callback when a confirmation link is expired or already spent.
  const { error } = await searchParams;

  return (
    <AuthScreen
      locale={locale}
      title={t("title")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-accent-ink underline underline-offset-4"
          >
            {t("signUpLink")}
          </Link>
        </>
      }
    >
      <LoginForm linkError={typeof error === "string" ? error : undefined} />
    </AuthScreen>
  );
}
