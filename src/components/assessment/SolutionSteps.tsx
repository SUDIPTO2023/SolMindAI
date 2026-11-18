"use client";

import { Formula } from "@/components/ui/Formula";
import { solutionSteps } from "@/lib/diagnosis-rules";
import type { ForceProblem, ValidationCheck } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

/** The worked solution, with each step marked against the student's own working. */
export function SolutionSteps({ problem, checks }: { problem: ForceProblem; checks: ValidationCheck[] }) {
  const i18n = useLanguage();
  const steps = solutionSteps(problem);
  return (
    <section className="panel p-6">
      <h2 className="font-semibold">{i18n.t("Step-by-step solution")}</h2>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => {
          const check = checks.find((c) => c.id === s.checkId);
          const note = check?.passed === true ? "Your working matched" : check?.passed === false ? "Your working missed this" : "Not shown in your working";
          return (
            <li key={s.title} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink/[0.06] font-mono text-xs">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{i18n.tx(s.title)}</p>
                  <span
                    className={cn(
                      "text-xs",
                      check?.passed === true && "text-ok-ink",
                      check?.passed === false && "text-bad-ink",
                      check?.passed === null && "text-muted",
                    )}
                  >
                    {i18n.tx(note)}
                  </span>
                </div>
                <div className="mt-1.5 overflow-x-auto rounded-md border border-line bg-base/60 px-3 py-2.5">
                  <Formula tex={s.tex} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
