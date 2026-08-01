import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware replacements for `next/link` and `next/navigation`. Use these
 * rather than the Next.js originals so the current locale prefix is kept on
 * every href, and `<Link locale="zh">` can switch it deliberately.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
