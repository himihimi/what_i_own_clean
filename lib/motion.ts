import type { Transition } from "motion/react";

/**
 * Motion tokens. See docs/design.md.
 *
 * Five durations, not a free-for-all: anything that animates picks one of
 * these, so timing stays consistent across screens. Values are seconds,
 * because that is what Motion takes.
 */
export const transitions = {
  /** Chip and tag toggles, dot colour changes. */
  instant: { duration: 0.12, ease: "easeOut" },
  /** Card press, hover, tab colour, a field appearing. */
  quick: { duration: 0.18, ease: "easeOut" },
  /** Screen entrance: fade up from 8px. */
  screen: { duration: 0.26, ease: "easeOut" },
  /** Bottom sheet in and out. */
  sheet: { duration: 0.3, ease: [0.3, 0.8, 0.3, 1] },
  /** Toast: scale from .9 with opacity. */
  toast: { duration: 0.25, ease: "easeOut" },
} satisfies Record<string, Transition>;

/** Press feedback. Cards sink slightly further than rows and buttons. */
export const press = {
  card: { scale: 0.97 },
  row: { scale: 0.98 },
} as const;

/** The screen entrance, as initial/animate pairs. */
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
} as const;
