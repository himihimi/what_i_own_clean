import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * shadcn's Button, adapted on arrival. Three things changed from the generated
 * file, all recorded in docs/design.md:
 *
 * 1. `hover:bg-muted` became `hover:bg-surface-2`. shadcn's `muted` is a
 *    background; ours is secondary text, so the original would have painted a
 *    dark green fill on hover.
 * 2. Sizes moved up to a 44px floor for `default` and `icon`. shadcn ships a
 *    32px desktop scale, and this is a mobile-first app.
 * 3. Press feedback is `scale(.98)` rather than a 1px nudge, matching the
 *    motion tokens. globals.css collapses it under prefers-reduced-motion.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-surface text-text hover:bg-surface-2 aria-expanded:bg-surface-2",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70 aria-expanded:bg-secondary",
        ghost:
          "text-muted hover:bg-surface-2 hover:text-text aria-expanded:bg-surface-2 aria-expanded:text-text",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-accent-ink underline-offset-4 hover:underline",
      },
      size: {
        // 44px is the tap-target floor. Anything below it is for pointer-first
        // surfaces or needs padding around it to reach 44.
        default: "h-11 gap-2 px-4",
        sm: "h-9 gap-1.5 rounded-sm px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-13 gap-2 px-5 text-[15px]",
        icon: "size-11",
        "icon-sm": "size-9 rounded-sm",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
