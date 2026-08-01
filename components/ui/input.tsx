import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * shadcn's Input, adapted on arrival — see docs/design.md.
 *
 * Height goes from 32px to 44px, radius from `lg` to `md` to match the login
 * spec, and the fill is `surface` rather than transparent, since inputs sit on
 * the tinted auth backdrop and need to read as fields. `md:text-sm` is dropped:
 * 16px is what stops iOS Safari zooming the viewport on focus, and this is a
 * mobile-first app.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-surface px-4 py-2 text-base text-text transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-disabled focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
