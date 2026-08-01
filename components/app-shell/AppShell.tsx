import type { ReactNode } from "react";

import { BottomNav } from "./BottomNav";

/**
 * The frame every signed-in screen sits in: a sticky top bar, a scrolling body,
 * and the fixed tab bar. The auth screens deliberately do not use it — they have
 * no navigation to offer someone who is not signed in yet.
 *
 * `min-h-svh` rather than `min-h-screen`: on mobile browsers `vh` is the height
 * with the toolbars hidden, so a screen sized in `vh` is taller than the visible
 * area and the page starts life slightly scrolled.
 *
 * The body's bottom padding clears the tab bar and the home indicator below it,
 * so the last card in a list is reachable rather than sitting under the nav.
 * Content is capped and centred: a phone-shaped column is a holding position for
 * wide screens until there is a real desktop layout — see docs/design.md.
 */
export function AppShell({
  header,
  children,
}: {
  header?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-bg">
      {header}

      <main
        className="mx-auto w-full max-w-[480px] flex-1 px-4 pt-1"
        style={{
          paddingBottom: "calc(78px + env(safe-area-inset-bottom) + 1rem)",
        }}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
