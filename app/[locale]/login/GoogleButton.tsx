"use client";

import { useTranslations } from "next-intl";

import { GoogleLogo } from "@/components/icons/GoogleLogo";
import { Button } from "@/components/ui/button";

/**
 * The only way in, for now. Email OTP is still the plan and its strings are
 * already translated, but a second path is not worth showing until either one
 * actually signs anybody in.
 *
 * `outline` rather than the pink `default`: Google's branding terms are specific
 * about how their button may look, and pink is not among the options. The accent
 * returns to this screen when email OTP does.
 *
 * Does nothing yet — Supabase OAuth is wired at M1.
 */
export function GoogleButton() {
  const t = useTranslations("login");

  return (
    <Button
      variant="outline"
      size="lg"
      className="mt-8 w-full gap-3 font-semibold"
    >
      <GoogleLogo />
      {t("google")}
    </Button>
  );
}
