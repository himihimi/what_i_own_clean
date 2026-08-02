import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

import { CallbackHandler } from "./CallbackHandler";

/**
 * Where an emailed link lands — the reset link and the sign-up confirmation
 * both.
 *
 * **It carries a locale, unlike the rest of the emailed-link machinery**,
 * because the app builds `emailRedirectTo` in the browser, where the language is
 * known. That is what lets this be an ordinary page under `[locale]`: it gets
 * the app's layout and its translations, and the reader is never shown a screen
 * in the wrong language. The locale-less `/challenge/callback` still exists, and
 * forwards here, for a link that could not carry one.
 *
 * Nothing is decided on the server: the session arrives in the URL fragment,
 * which never leaves the browser. This renders a held breath — the backdrop and
 * the plate, no copy to read — while the handler redeems it and moves on. See
 * docs/architecture.md.
 */
export default async function CallbackPage({
  params,
}: PageProps<"/[locale]/challenge/callback">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("callback");
  const tApp = await getTranslations("app");

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center px-8"
      style={{ background: "var(--auth-backdrop)" }}
    >
      <div
        aria-hidden="true"
        className="grid size-[74px] place-items-center rounded-[22px] bg-lime text-4xl font-extrabold text-on-accent shadow-lime-glow"
      >
        {tApp("mark")}
      </div>

      {/* Announced, not shown: this screen is a step, not something to read, and
          it is gone before a sentence could be finished. */}
      <p role="status" className="sr-only">
        {t("signingIn")}
      </p>

      <CallbackHandler locale={locale} />
    </div>
  );
}
