import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

import { LoginForm } from "./LoginForm";

export default async function LoginPage({ params }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("login");
  const tApp = await getTranslations("app");

  return (
    // Full viewport, one column, capped so a wide screen shows a phone-shaped
    // column rather than a stretched one. No device frame — see docs/design.md.
    <div
      className="flex min-h-svh flex-col items-center justify-center px-8 py-10"
      style={{ background: "var(--auth-backdrop)" }}
    >
      <div className="flex w-full max-w-[420px] flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="grid size-[74px] place-items-center rounded-[22px] bg-lime text-4xl font-extrabold text-[#16310c] shadow-[0_12px_26px_rgba(174,198,88,0.5)]"
        >
          {tApp("mark")}
        </div>

        <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-text">
          {tApp("name")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>

        <LoginForm />

        <p className="mt-6 text-[11px] leading-relaxed text-muted">
          {t("terms")}
        </p>
      </div>
    </div>
  );
}
