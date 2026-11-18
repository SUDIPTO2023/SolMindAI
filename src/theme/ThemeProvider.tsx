"use client";

import { useEffect } from "react";
import { useThemeStore } from "./theme-store";

/** Picks up the theme the boot script set, after hydration, so server and client markup match. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useThemeStore.getState().syncFromDocument();
  }, []);
  return <>{children}</>;
}
