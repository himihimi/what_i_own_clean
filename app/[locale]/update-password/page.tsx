import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthScreen } from "@/components/AuthScreen";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { currentUser } from "@/lib/auth/server";

import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default async function UpdatePasswordPage({
  params,
}: PageProps<"/[locale]/update-password">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  /*
   * A session is the authorisation to change a password, and here it came from
   * the emailed link by way of /auth/callback. Without one there is nothing to
   * update, so send them to ask for a fresh link — which is also what happens if
   * this URL is opened directly or the link has already been spent.
   */
  const user = await currentUser();
  if (!user) {
    return redirect({ href: "/forgot-password", locale });
  }

  const t = await getTranslations("updatePassword");

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
      <UpdatePasswordForm />
    </AuthScreen>
  );
}
