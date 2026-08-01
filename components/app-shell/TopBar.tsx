import type { ReactNode } from "react";

/**
 * The app's top bar, from demo.html's `.header`: an optional lime logo plate, a
 * title, and icon actions pushed to the right.
 *
 * Sticky rather than the mockup's static header, with the same translucent blur
 * as the tab bar — on a phone browser the content scrolls under it, and having
 * both edges of the screen behave the same way reads as deliberate.
 *
 * Actions are a slot rather than a fixed set, because which ones belong here
 * differs per screen: the mockup shows search and profile on the feed, only
 * search on collections, and nothing on a detail page.
 */
export function TopBar({
  title,
  mark,
  actions,
}: {
  title: string;
  /** Single glyph for the lime plate. Omitted, no plate is drawn. */
  mark?: string;
  actions?: ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-bg/94 backdrop-blur-[12px]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex w-full max-w-[480px] items-center gap-[11px] px-4 py-2.5">
        {mark && (
          <div
            aria-hidden="true"
            // Same reasoning as the auth screens' plate: the fill keeps its
            // colour across themes, so the glyph has to stay dark ink.
            className="grid size-[34px] flex-none place-items-center rounded-[11px] bg-lime text-[17px] font-extrabold text-on-accent"
          >
            {mark}
          </div>
        )}

        <h1 className="truncate text-[23px] font-extrabold tracking-tight text-text">
          {title}
        </h1>

        {actions && (
          <div className="ml-auto flex flex-none items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
