export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

/** The order the toggle cycles through. */
export const themeModes: readonly ThemeMode[] = ["system", "light", "dark"];

/**
 * Applied before first paint via an inline <script>, so a stored theme does not
 * flash the other one first. It has to be a string: a React effect runs after
 * paint, which is exactly too late.
 *
 * "system" stores nothing and leaves the attribute off, so the
 * prefers-color-scheme block in globals.css decides.
 */
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = mode;
  }
}

export function readTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Private browsing and blocked storage both throw rather than return null.
    return "system";
  }
}

function storeTheme(mode: ThemeMode) {
  try {
    if (mode === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  } catch {
    // Not being able to remember the choice is not worth breaking the toggle.
  }
}

/**
 * The theme is browser state, not React state, so it is exposed as a store for
 * `useSyncExternalStore` — which reads it during render on the client and falls
 * back to a server snapshot, instead of correcting itself in an effect.
 */
const listeners = new Set<() => void>();

export function subscribeTheme(onChange: () => void) {
  listeners.add(onChange);

  // Another tab changing the theme should move this one too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      applyTheme(readTheme());
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setTheme(mode: ThemeMode) {
  storeTheme(mode);
  applyTheme(mode);
  listeners.forEach((notify) => notify());
}
