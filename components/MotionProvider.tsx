"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Motion does not ship "use client" directives, so every motion import lives
 * behind a boundary like this one.
 *
 * `reducedMotion="user"` makes Motion honour prefers-reduced-motion by dropping
 * transform and layout animations while keeping opacity. globals.css does the
 * same for CSS transitions, but Motion runs through the Web Animations API and
 * needs telling separately.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
