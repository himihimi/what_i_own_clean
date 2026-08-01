"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { navItems, type NavItem } from "./navItems";

/**
 * The bottom tab bar, from demo.html's `.tabbar`: 78px tall, the page colour at
 * 94% with a blur behind it, a hairline top border.
 *
 * Three departures from the mockup, each for a reason recorded in docs/design.md:
 *
 * - The active tab is `lime-ink`, not the mockup's pink. An active tab says where
 *   you are — that is state, and state is lime here; pink is reserved for things
 *   you can press. `lime-ink` rather than raw `lime` because raw lime on the page
 *   colour is 1.76:1, unreadable as a label.
 * - Labels are 11px, not the mockup's 10px, which is under the type floor.
 * - The FAB's icon is `on-accent`, not white. White on the pink fails even the
 *   3:1 floor for non-text contrast.
 *
 * Fixed, and padded for `env(safe-area-inset-bottom)` so it clears the iOS home
 * indicator rather than sitting under it. Its row is capped to the same width as
 * page content, so on a wide screen it stays a phone-shaped column instead of
 * stretching across the viewport.
 */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/94 backdrop-blur-[12px]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-[78px] w-full max-w-[480px] items-center justify-around px-2">
        {navItems.map((item) =>
          item.fab ? (
            <Fab key={item.key} item={item} label={t(item.key)} />
          ) : (
            <Tab
              key={item.key}
              item={item}
              label={t(item.key)}
              active={pathname === item.href}
            />
          ),
        )}
      </div>
    </nav>
  );
}

function Tab({
  item,
  label,
  active,
}: {
  item: NavItem;
  label: string;
  active: boolean;
}) {
  const Icon = item.icon;

  const content = (
    <>
      <Icon size={24} aria-hidden="true" />
      <span className="text-[11px] font-semibold">{label}</span>
    </>
  );

  const shape =
    "flex min-h-11 w-[52px] flex-col items-center justify-center gap-[3px]";

  if (!item.ready) {
    return (
      <span
        aria-disabled="true"
        title={label}
        className={cn(shape, "text-disabled")}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        shape,
        "transition-colors",
        active ? "text-lime-ink" : "text-muted",
      )}
    >
      {content}
    </Link>
  );
}

/**
 * The centre action. A rounded square at radius 18 rather than a circle — the
 * mockup's choice, and the thing that stops it reading as a Material default.
 */
function Fab({ item, label }: { item: NavItem; label: string }) {
  const Icon = item.icon;

  const shape =
    "grid size-[52px] place-items-center rounded-[18px] text-on-accent";

  if (!item.ready) {
    return (
      <span
        aria-disabled="true"
        title={label}
        className={cn(shape, "bg-disabled")}
      >
        <Icon size={26} strokeWidth={2.4} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-label={label}
      className={cn(
        shape,
        "bg-linear-135 from-accent to-accent-2 transition-transform active:scale-[0.97]",
      )}
    >
      <Icon size={26} strokeWidth={2.4} aria-hidden="true" />
    </Link>
  );
}
