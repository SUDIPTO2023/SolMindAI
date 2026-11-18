"use client";

import { useEffect } from "react";
import { rehydrateLearningStore, useLearningStore } from "@/store/learning-store";
import { useLanguage } from "@/i18n/use-language";

/** Shows a skeleton until the saved demo state has been read from the browser. */
export function HydrationGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const i18n = useLanguage();
  const ready = useLearningStore((s) => s.hasHydrated);
  useEffect(() => {
    rehydrateLearningStore();
  }, []);

  if (ready) return <>{children}</>;
  return (
    fallback ?? (
      <div role="status" className="space-y-4" aria-label={i18n.t("Loading your learning data")}>
        <div className="h-8 w-64 animate-pulse rounded-md bg-ink/[0.06]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-ink/[0.04]" />
        <div className="grid gap-4 pt-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg bg-ink/[0.04]" />
          ))}
        </div>
      </div>
    )
  );
}
