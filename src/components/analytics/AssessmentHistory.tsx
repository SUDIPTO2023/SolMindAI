"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { QuestionAttempt } from "@/types/assessment";
import type { Topic } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const GAP = { conceptual: "Conceptual gap", mathematical: "Mathematical gap", mixed: "Mixed gap", none: "No gap", insufficient_evidence: "Unclear" } as const;

export function AssessmentHistory({ attempts, topics }: { attempts: QuestionAttempt[]; topics: Topic[] }) {
  const i18n = useLanguage();
  const [scope, setScope] = useState<"all" | "session">("all");
  const rows = [...attempts].filter((a) => scope === "all" || !a.isSample).sort((a, b) => b.at.localeCompare(a.at));
  const when = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{i18n.t("Assessment history")}</h2>
          <p className="mt-1 text-sm text-muted">{i18n.t("Every recorded answer, newest first.")}</p>
        </div>
        <div role="group" aria-label={i18n.t("Show")} className="flex rounded-md border border-line p-0.5 text-xs">
          {(["all", "session"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={scope === s} onClick={() => setScope(s)} className={cn("rounded px-2.5 py-1", scope === s ? "bg-elevated text-text" : "text-muted hover:text-text")}>
              {i18n.tx(s === "all" ? "All answers" : "This session only")}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{i18n.t("No answers in this session yet. Take the diagnostic to start your record.")}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                {["When", "Question", "Topic", "Difficulty", "Bloom", "Result", "Hints", "Source"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 font-medium">{i18n.tx(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-line/60 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted">{i18n.tx(when(a.at))}</td>
                  <td className="px-3 py-2.5">{i18n.tx(a.label)}</td>
                  <td className="px-3 py-2.5 text-muted">{i18n.tx(topics.find((t) => t.id === a.topicId)?.title ?? a.topicId)}</td>
                  <td className="px-3 py-2.5">{i18n.tx(a.difficulty)}</td>
                  <td className="px-3 py-2.5">{i18n.tx(a.bloom)}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center gap-1.5", a.correct ? "text-ok-ink" : "text-bad-ink")}>
                      {a.correct ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />}
                      {i18n.tx(a.correct ? "Correct" : a.gapType ? GAP[a.gapType] : "Incorrect")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{a.hintsUsed}</td>
                  <td className="px-3 py-2.5">{a.isSample ? <Badge>{i18n.t("Sample")}</Badge> : <Badge tone="cyan">{i18n.t("This session")}</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
