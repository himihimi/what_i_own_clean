import { Boxes, House, Plus, Sparkles, type LucideIcon } from "lucide-react";

/**
 * The bottom navigation, in display order. The `add` item renders as the FAB
 * rather than a tab — see BottomNav.
 *
 * `ready` is what keeps this honest: a destination whose screen does not exist
 * yet renders as a visibly disabled tab instead of a link that 404s. Building
 * the screen means adding the route and flipping the flag, nothing else.
 *
 * Collections is in the mockups and deliberately absent here: the architecture
 * defers it until there is real data to design against.
 */
export type NavItem = {
  key: "home" | "library" | "add" | "assistant";
  href: string;
  icon: LucideIcon;
  ready: boolean;
  /** Renders as the centre action button rather than a tab. */
  fab?: boolean;
};

export const navItems: readonly NavItem[] = [
  // Points at /welcome for now. The real home is the library grid at M2, at
  // which point this splits into a feed and a library properly.
  { key: "home", href: "/welcome", icon: House, ready: true },
  { key: "library", href: "/library", icon: Boxes, ready: false },
  { key: "add", href: "/add", icon: Plus, ready: false, fab: true },
  { key: "assistant", href: "/assistant", icon: Sparkles, ready: false },
];
