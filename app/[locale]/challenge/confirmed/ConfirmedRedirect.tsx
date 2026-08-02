"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useRouter } from "@/i18n/navigation";

/**
 * Counts down and then moves on, for the reader who has read the screen and left
 * it open.
 *
 * The number is shown rather than the page simply changing under them: a screen
 * that navigates on its own with no warning is disorienting, and the copy rules
 * in docs/design.md ask for the real number rather than "shortly".
 *
 * `replace`, not `push`: this screen is the end of an emailed link and there is
 * nothing to come back to. Not a live region either — a per-second announcement
 * would drown out everything else on the screen.
 */
export function ConfirmedRedirect({
  href,
  seconds,
}: {
  href: string;
  seconds: number;
}) {
  const t = useTranslations("confirmed");
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      router.replace(href);
      return;
    }

    const timer = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, href, router]);

  return <>{t("redirecting", { seconds: remaining })}</>;
}
