import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A field's value, in one of the three states it can be in. The most reused
 * thing in the app — see docs/components.md §3.
 *
 * | State | Means |
 * |---|---|
 * | `value` | a value, the same on every piece |
 * | `deferred` | the pieces disagree, so the value is in the piece boxes below |
 * | `empty` | not filled in |
 *
 * **An empty field keeps its place and loses its value.** Hiding it would make
 * the page reshuffle as data arrives, and someone looking for a field they
 * filled last week should find it where they left it. It shows an em dash rather
 * than *add* because most fields on most things are legitimately empty — an SD
 * card has no size and no material — and a page of prompts reads as perpetually
 * unfinished. Prompting belongs in the editor.
 */
export function ValueChip({
  label,
  state = "value",
  children,
}: {
  label: string;
  state?: "value" | "deferred" | "empty";
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-baseline gap-1.5 rounded-xs px-2.5 py-1.5 text-[13px]",
        state === "empty"
          ? // The dashed outline is a real border, so the padding is inset by
            // its width. Without that an empty chip stands 2px taller than a
            // filled one and a mixed row goes ragged.
            "border border-dashed border-border px-[9px] py-[5px]"
          : "bg-surface-2",
      )}
    >
      <span className="shrink-0 text-[11px] font-semibold text-muted">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 truncate",
          state === "value" ? "text-text" : "text-muted",
        )}
      >
        {children}
      </span>
    </div>
  );
}
