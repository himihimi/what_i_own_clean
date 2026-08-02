import { cn } from "@/lib/utils";
import type { Condition, Usage } from "@/lib/items/types";

/**
 * A state word, tinted by what it means rather than by which field it came from.
 *
 * **Pink appears nowhere here.** A status is something the system knows, and
 * docs/design.md §2 gives state to lime and amber; pink is reserved for things
 * you can press. A tag that looks tappable and is not is a small lie told on
 * every screen it appears.
 */
export type Tone = "good" | "attention" | "bad" | "held";

const tones: Record<Tone, string> = {
  good: "bg-lime-soft text-lime-ink",
  attention: "bg-amber-soft text-amber-ink",
  bad: "bg-danger-soft text-danger",
  // The only untinted tone, so it is the only one that needs an outline: its
  // fill is `surface-2`, and it sits on `surface-2` when it labels a thumbnail.
  // Without the hairline it disappears exactly where the others read fine.
  held: "bg-surface-2 text-muted ring-1 ring-border ring-inset",
};

/** Every closed-set value that renders as a tag, and what it means. */
export const statusTone: Record<Usage | Condition, Tone> = {
  often: "good",
  new: "good",
  sometimes: "attention",
  unused: "attention",
  marked: "attention",
  worn: "attention",
  unusable: "bad",
  lost: "bad",
  stored: "held",
};

export function StatusTag({
  value,
  children,
}: {
  value: Usage | Condition;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2 py-0.5 text-[11px] font-semibold",
        tones[statusTone[value]],
      )}
    >
      {children}
    </span>
  );
}
