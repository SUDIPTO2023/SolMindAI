"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { cn } from "@/lib/utils";
import { useThemeStore } from "./theme-store";

/** One global switch between the original dark theme and the light theme. */
export function ThemeToggle({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggleTheme);
  const i18n = useLanguage();
  const label = i18n.tx(theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        "relative grid shrink-0 place-items-center overflow-hidden rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-text",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.18 }}
          className="grid place-items-center"
        >
          {theme === "dark" ? <Sun size={size === "sm" ? 15 : 17} aria-hidden="true" /> : <Moon size={size === "sm" ? 14 : 16} aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
