import { CircleCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthScreen } from "@/components/AuthScreen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { authPaths } from "@/lib/auth/routes";
import { currentUser } from "@/lib/auth/server";

import { ConfirmedRedirect } from "./ConfirmedRedirect";

/** Long enough to read the screen, short enough not to look stuck. */
const REDIRECT_SECONDS = 30;

/**
 * Where a confirmed address lands.
 *
 * The confirmation is already done by the time this renders — the callback
 * verified the token. This screen exists to say so, because the alternative is
 * dropping someone into the app with no acknowledgement that the thing they were
 * asked to do worked.
 *
 * Verifying a sign-up token also signs the reader in, so the usual case offers to
 * continue. If it did not — the token was verified but no session came back — the
 * address is confirmed regardless and signing in is one screen away. Both are
 * true statements about the same event, which is why one screen serves both.
 */
export default async function ConfirmedPage({
  params,
}: PageProps<"/[locale]/challenge/confirmed">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const user = await currentUser();
  const t = await getTranslations("confirmed");

  const destination = user ? authPaths.home : authPaths.login;

  return (
    <AuthScreen
      locale={locale}
      title={t("title")}
      footer={
        <ConfirmedRedirect href={destination} seconds={REDIRECT_SECONDS} />
      }
    >
      <div className="mt-8 w-full text-left">
        <Alert>
          {/* Decorative: the Alert's own role announces the message. */}
          <CircleCheck aria-hidden="true" />
          <AlertDescription>{t("body")}</AlertDescription>
        </Alert>

        {/* The action, so it takes the accent — nothing else on this screen
            competes for it. */}
        <Button asChild size="lg" className="mt-4 w-full">
          <Link href={destination}>{user ? t("continue") : t("logIn")}</Link>
        </Button>
      </div>
    </AuthScreen>
  );
}
