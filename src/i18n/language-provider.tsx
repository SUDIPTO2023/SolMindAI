"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, type Language } from "./config";

/** Applies the language to <html lang> at once, before React re-renders, so CSS and text measurement match. */
function applyToDocument(language: Language) {
  if (typeof document !== "undefined") document.documentElement.lang = language;
}

interface LanguageState {
  language: Language;
  hydrated: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

/** The selected language. Separate from the learning store: it never touches progress. */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: DEFAULT_LANGUAGE,
      hydrated: false,
      setLanguage: (language) => {
        applyToDocument(language);
        set({ language });
      },
      toggleLanguage: () => get().setLanguage(get().language === "en" ? "bn" : "en"),
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // The server always renders English. The saved choice is applied after hydration,
      // so the first client render matches the server and no hydration error occurs.
      skipHydration: true,
      partialize: (s) => ({ language: s.language }),
      onRehydrateStorage: () => (state) => {
        if (state) applyToDocument(state.language);
        useLanguageStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Loads the saved language once and keeps <html lang> in step, for fonts and screen readers. */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    if (!useLanguageStore.getState().hydrated) void useLanguageStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
}
