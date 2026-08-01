"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

import { fadeUp, transitions } from "@/lib/motion";

/**
 * The screen entrance: fade up from 8px, on the `screen` timing.
 *
 * Children are passed through, so server-rendered content stays server
 * rendered — only the wrapper is a client component. Stagger a group by giving
 * each one a slightly larger `delay`.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ ...transitions.screen, delay }}
    >
      {children}
    </motion.div>
  );
}
