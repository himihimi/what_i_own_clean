import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { LocaleSwitch } from "@/components/LocaleSwitch";
import { Reveal } from "@/components/Reveal";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * The shell both auth screens sit in: backdrop, logo plate, heading, the theme
 * and locale controls, and the terms line. Login and signup differ only in their
 * heading, their form, and the link at the bottom.
 *
 * A server component — the form inside it is what needs to be client-side.
 */
export async function AuthScreen({
  locale,
  title,
  children,
  footer,
}: {
  locale: Locale;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const t = await getTranslations("auth");
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
            // `on-accent` rather than `text`: the plate stays lime in dark mode,
            // so its ink has to stay dark. Light text on lime is about 1.9:1.
            className="grid size-[74px] place-items-center rounded-[22px] bg-lime text-4xl font-extrabold text-on-accent shadow-lime-glow"
          >
            {tApp("mark")}
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-text">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
        </Reveal>

        <Reveal delay={0.12} className="w-full">
          {children}
        </Reveal>

        <Reveal delay={0.18} className="w-full">
          <p className="mt-6 text-sm text-muted">{footer}</p>
          <p className="mt-6 text-[11px] leading-relaxed text-muted-2">
            {t("terms")}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
