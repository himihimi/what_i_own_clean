"use client";

import { Moon, Sun, SunMoon, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import { press, transitions } from "@/lib/motion";
import {
  readTheme,
  setTheme,
  subscribeTheme,
  themeModes,
  type ThemeMode,
} from "@/lib/theme";

/** SunMoon rather than a monitor: "follows the system" on a phone, not a desktop. */
const icons: Record<ThemeMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: SunMoon,
};

/**
 * Cycles system → light → dark. Three states rather than two, because the
 * settings screen offers "follow system" and that has to be reachable.
 */
export function ThemeToggle() {
  const t = useTranslations("theme");

  // Server-rendered markup cannot know the stored choice, so it renders
  // "system" and the client corrects it on hydration. The document itself is
  // already on the right theme by then — the inline script in <head> set it.
  const mode = useSyncExternalStore(
    subscribeTheme,
    readTheme,
    (): ThemeMode => "system",
  );

  const Icon = icons[mode];

  function cycle() {
    setTheme(themeModes[(themeModes.indexOf(mode) + 1) % themeModes.length]);
  }

  return (
    <motion.button
      type="button"
      onClick={cycle}
      whileTap={press.row}
      transition={transitions.quick}
      aria-label={`${t("label")}: ${t(mode)}`}
      className="grid size-11 place-items-center rounded-full border border-border bg-surface text-muted"
    >
      <Icon size={18} aria-hidden="true" />
    </motion.button>
  );
}
