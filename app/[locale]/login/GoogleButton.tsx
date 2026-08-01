"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { GoogleLogo } from "@/components/icons/GoogleLogo";
import { press, transitions } from "@/lib/motion";

/**
 * The only way in, for now. Email OTP is still the plan and its strings are
 * already translated, but a second path is not worth showing until either one
 * actually signs anybody in.
 *
 * A light surface with a border rather than the pink primary fill: Google's
 * branding terms are specific about how their button may look, and pink is not
 * among the options. The accent returns to this screen when email OTP does.
 *
 * Does nothing yet — Supabase OAuth is wired at M1.
 */
export function GoogleButton() {
  const t = useTranslations("login");

  return (
    <motion.button
      type="button"
      whileTap={press.row}
      transition={transitions.quick}
      className="mt-8 flex w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-4 text-[15px] font-semibold text-text"
    >
      <GoogleLogo />
      {t("google")}
    </motion.button>
  );
}
