"use client";

import { motion } from "motion/react";
import { LANGUAGES } from "./config";
import { useLanguage } from "./use-language";
import { cn } from "@/lib/utils";

/** [ English ] [ বাংলা ] — switches instantly, keeps the route and all learning state. */
export function LanguageSwitcher({ compact = false, className, id = "lang" }: { compact?: boolean; className?: string; id?: string }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div role="group" aria-label="Language / ভাষা" className={cn("inline-flex shrink-0 rounded-md border border-line bg-ink/[0.02] p-0.5", className)}>
      {LANGUAGES.map((l) => {
        const on = l.id === language;
        return (
          <button
            key={l.id}
            type="button"
            lang={l.id}
            aria-pressed={on}
            onClick={() => setLanguage(l.id)}
            className={cn("relative rounded px-2.5 py-1 text-xs font-medium transition-colors", on ? "text-text" : "text-muted hover:text-text")}
          >
            {on && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded bg-elevated" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{compact ? l.short : l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
