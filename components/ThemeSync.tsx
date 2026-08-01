"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

import { applyTheme, readTheme } from "@/lib/theme";

/**
 * Re-applies the stored theme after every navigation.
 *
 * React 19 treats <html> as a host singleton: when the root layout re-renders —
 * which a locale switch forces, since the locale is a route param — React
 * re-acquires the element and keeps only the attributes it rendered itself.
 * `data-theme` is set by the inline script in <head>, not by React, so it gets
 * dropped and the theme falls back to the system preference. A reload looks
 * correct because the script runs again.
 *
 * A layout effect runs after the DOM update but before paint, so the attribute
 * is back before anything is drawn and the switch does not flash.
 *
 * The pathname comes from next/navigation rather than next-intl, deliberately:
 * next-intl strips the locale prefix, so /en/login and /zh/login would both
 * read as "/login" and the effect would never re-run on a locale change.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeSync() {
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    applyTheme(readTheme());
  }, [pathname]);

  return null;
}
