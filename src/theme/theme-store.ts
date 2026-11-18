"use client";

import { create } from "zustand";

export type Theme = "dark" | "light";

/** localStorage key. Separate from the language and learning records. */
export const THEME_STORAGE_KEY = "solmind-theme";
/** The original dark theme is the default for first-time visitors. */
export const DEFAULT_THEME: Theme = "dark";

/** Runs in <head> before first paint, so a saved light theme never flashes dark. */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark')t='${DEFAULT_THEME}';var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t;}catch(e){}})();`;

function apply(theme: Theme, animate: boolean) {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduce) {
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 260);
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** Reads the theme the boot script already applied. */
  syncFromDocument: () => void;
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: DEFAULT_THEME,
  setTheme: (theme) => {
    apply(theme, true);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage unavailable: the theme still applies for this visit */
    }
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
  syncFromDocument: () => {
    const t = document.documentElement.dataset.theme;
    if (t === "light" || t === "dark") set({ theme: t });
  },
}));
