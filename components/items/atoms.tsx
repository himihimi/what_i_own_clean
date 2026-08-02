import { cn } from "@/lib/utils";

/**
 * The small pieces the item screens are mostly made of. Grouped in one file
 * because each is a handful of lines and they are always read together — see
 * docs/components.md §3.
 */

/**
 * The image plate: library card, hero, editor row.
 *
 * Holds an emoji until images are stored, on the same tinted plate a photograph
 * will sit on, so the layout does not move when they arrive.
 */
export function Thumb({
  emoji,
  size = "card",
}: {
  emoji?: string;
  size?: "card" | "hero";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-md bg-surface-2",
        size === "card" ? "aspect-square w-full text-4xl" : "size-[66px] text-3xl",
      )}
    >
      {emoji}
    </div>
  );
}

/**
 * A section's name.
 *
 * Small and heavy against content that is large and light. When both were heavy
 * and dark the eye read a sentence of content as another heading, so the
 * contrast is carried by weight rather than size — see docs/components.md §4.
 */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-5 mb-2 text-[13px] font-extrabold tracking-tight text-text">
      {children}
    </h2>
  );
}

/**
 * How many there are.
 *
 * **Plain text, never a pill.** A count is a measurement, not a filter — a pill
 * background makes people try to tap it.
 */
export function CountLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("text-base font-semibold text-muted", className)}>
      {children}
    </span>
  );
}

/**
 * A colour dot and its name.
 *
 * The dot makes this line box a little taller than a plain one, so a chip
 * holding a swatch measures under a pixel more than its neighbours. Rows of
 * chips stretch to a common height, which is what settles it — see `ValueChip`.
 */
export function ColorSwatch({ hex, name }: { hex: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full border border-border"
        style={{ background: hex }}
      />
      {name}
    </span>
  );
}

/**
 * One to five hearts.
 *
 * Read-only here; the editor gets its own that takes input. The filled count is
 * the accessible name, because five glyphs announce as nothing useful.
 */
export function HeartRating({ value, label }: { value: number; label: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <div className="flex gap-0.5 text-sm leading-none" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={index < filled ? "text-accent" : "text-disabled"}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

/**
 * The one-line opinion.
 *
 * Marked by a quotation mark rather than a filled block: the comments below are
 * already tinted notes, and a second block turns the page into competing panels.
 * Larger and lighter than the heading above it, which is what stops it reading
 * as one.
 */
export function VerdictQuote({ children }: { children: React.ReactNode }) {
  return (
    <p className="relative pl-5 text-base leading-relaxed text-muted">
      <span
        aria-hidden="true"
        className="absolute top-1 left-0 font-serif text-2xl leading-none text-disabled"
      >
        &ldquo;
      </span>
      {children}
    </p>
  );
}

/** A tag someone put on the thing themselves. */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-xs bg-lime-soft px-2 py-0.5 text-[11px] font-semibold text-lime-ink">
      {children}
    </span>
  );
}
