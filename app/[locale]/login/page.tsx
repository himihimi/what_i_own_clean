import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LocaleSwitch } from "@/components/LocaleSwitch";
import { Reveal } from "@/components/Reveal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { routing } from "@/i18n/routing";

import { GoogleButton } from "./GoogleButton";

export default async function LoginPage({
  params,
}: PageProps<"/[locale]/login">) {
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
      className="relative flex min-h-svh flex-col items-center justify-center px-8 py-10"
      style={{ background: "var(--auth-backdrop)" }}
    >
      {/* Both controls belong before sign-in: someone who cannot read the
          current language cannot find them in a settings screen they have no
          account for. Absolute, so they do not shift the centred column. */}
      <Reveal
        className="absolute right-4 flex items-center gap-2"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        <ThemeToggle />
        <LocaleSwitch current={locale} />
      </Reveal>

      <div className="flex w-full max-w-[420px] flex-col items-center text-center">
        {/* Staggered by 60ms so the screen assembles top-down rather than
            appearing all at once. */}
        <Reveal>
          <div
            aria-hidden="true"
            className="grid size-[74px] place-items-center rounded-[22px] bg-lime text-4xl font-extrabold text-[#16310c] shadow-[0_12px_26px_rgba(174,198,88,0.5)]"
          >
            {tApp("mark")}
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-text">
            {tApp("name")}
          </h1>
          <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
        </Reveal>

        <Reveal delay={0.12} className="w-full">
          <GoogleButton />
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mt-6 text-[11px] leading-relaxed text-muted-2">
            {t("terms")}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
