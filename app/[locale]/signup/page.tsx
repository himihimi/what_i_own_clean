import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthScreen } from "@/components/AuthScreen";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import { SignupForm } from "./SignupForm";

export default async function SignupPage({
  params,
}: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("signup");

  return (
    <AuthScreen
      locale={locale}
      title={t("title")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-accent-ink underline underline-offset-4"
          >
            {t("logInLink")}
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthScreen>
  );
}
