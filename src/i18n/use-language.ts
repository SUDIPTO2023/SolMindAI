"use client";

import { useCallback, useMemo } from "react";
import type { MessageKey } from "./dictionaries/bn";
import { useLanguageStore } from "./language-provider";
import { translateKey, translateText } from "./translate";

/**
 * t(key)  — fixed interface text, checked against the dictionary at compile time.
 * tx(value) — content from data or generated at run time (questions, tutor replies,
 *             evidence). Non-string values pass through untouched.
 */
export function useLanguage() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translateKey(key, language, vars),
    [language],
  );
  const tx = useCallback(<T,>(value: T): T => (typeof value === "string" ? (translateText(value, language) as T) : value), [language]);

  return useMemo(
    () => ({ language, setLanguage, toggleLanguage, t, tx, isBangla: language === "bn" }),
    [language, setLanguage, toggleLanguage, t, tx],
  );
}
