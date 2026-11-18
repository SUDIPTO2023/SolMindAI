"use client";

import { Check } from "lucide-react";
import type { AssessmentPhase } from "@/store/learning-store";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const STAGES = ["Readiness check", "Diagnostic question", "Gap investigation", "Result"];
const INDEX: Record<AssessmentPhase, number> = { readiness: 0, question: 1, evaluated: 2, followup: 2, complete: 3 };

export function AssessmentStepper({ phase }: { phase: AssessmentPhase }) {
  const i18n = useLanguage();
  const at = INDEX[phase];
  return (
    <ol className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4" aria-label={i18n.t("Assessment progress")}>
      {STAGES.map((s, i) => (
        <li
          key={s}
          aria-current={i === at ? "step" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
            i === at ? "border-purple/50 bg-purple/10 text-text" : i < at ? "border-line text-ok-ink" : "border-line text-muted",
          )}
        >
          <span
            className={cn(
              "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
              i < at ? "bg-success/20" : i === at ? "bg-purple text-white" : "bg-ink/[0.06]",
            )}
          >
            {i < at ? <Check size={12} aria-hidden="true" /> : i + 1}
          </span>
          {i18n.tx(s)}
        </li>
      ))}
    </ol>
  );
}
