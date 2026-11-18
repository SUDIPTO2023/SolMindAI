"use client";

import { motion } from "motion/react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { EvidenceStatus, GapType, Misconception } from "@/types/assessment";
import type { Topic } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

export interface DiagnosisView {
  gapType: GapType;
  status: EvidenceStatus;
  confidence: "low" | "medium" | "high";
  evidence: string[];
  misconceptionId: string | null;
  recommendedTopicId: string | null;
  nextAction: string;
}

const CATEGORIES: { id: GapType; label: string }[] = [
  { id: "conceptual", label: "Conceptual" },
  { id: "mathematical", label: "Mathematical" },
  { id: "mixed", label: "Mixed" },
  { id: "none", label: "No identified gap" },
  { id: "insufficient_evidence", label: "Insufficient evidence" },
];

const STATUS: Record<EvidenceStatus, { label: string; tone: BadgeTone }> = {
  suspected: { label: "Suspected", tone: "warning" },
  verified: { label: "Verified", tone: "error" },
  uncertain: { label: "Uncertain", tone: "cyan" },
  not_applicable: { label: "Nothing to confirm", tone: "success" },
};

function headline(d: DiagnosisView) {
  const v = d.status === "verified";
  switch (d.gapType) {
    case "conceptual": return v ? "A gap in the idea, confirmed" : "Possible gap in the idea";
    case "mathematical": return v ? "A slip in the calculation, confirmed" : "Possible slip in the calculation";
    case "mixed": return v ? "The idea is there, but it wasn’t applied" : "The idea may be there, but not applied";
    case "none": return "No gap found in this answer";
    default: return "Not enough evidence to name a gap";
  }
}

export function DiagnosisCard({
  diagnosis,
  misconceptions,
  topics,
}: {
  diagnosis: DiagnosisView;
  misconceptions: Misconception[];
  topics: Topic[];
}) {
  const i18n = useLanguage();
  const status = STATUS[diagnosis.status];
  const misconception = misconceptions.find((m) => m.id === diagnosis.misconceptionId);
  const topic = topics.find((t) => t.id === diagnosis.recommendedTopicId);
  const level = { low: 1, medium: 2, high: 3 }[diagnosis.confidence];
  const cleared = diagnosis.status === "verified" && diagnosis.gapType !== "none";

  return (
    <section className={cn("panel p-6", cleared && "border-error/40")} aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={status.tone}>{i18n.tx(status.label)}</Badge>
        <span className="flex items-center gap-1.5 text-xs text-muted">{i18n.t("Confidence:")}{" "}{i18n.tx(diagnosis.confidence)}
          <span className="flex gap-0.5" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1.5 w-4 rounded-full", i <= level ? "bg-cyan" : "bg-ink/10")} />
            ))}
          </span>
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold">{i18n.tx(headline(diagnosis))}</h2>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={i18n.t("Gap type")}>
        {CATEGORIES.map((c) => {
          const on = c.id === diagnosis.gapType;
          return (
            <li
              key={c.id}
              aria-current={on ? "true" : undefined}
              className={cn(
                "relative rounded-md border px-2.5 py-1 text-xs font-medium",
                on ? "border-purple/60 text-text" : "border-line text-muted/60",
              )}
            >
              {on && <motion.span layoutId="gap-category" className="absolute inset-0 rounded-md bg-purple/15" />}
              <span className="relative">{i18n.tx(c.label)}</span>
            </li>
          );
        })}
      </ul>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-muted">{i18n.t("Evidence collected")}</dt>
          <dd>
            <ul className="mt-1.5 space-y-1">
              {diagnosis.evidence.map((e) => (
                <li key={e} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple" aria-hidden="true" />
                  {i18n.tx(e)}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        {misconception && (
          <div className="sm:col-span-2">
            <dt className="text-muted">{i18n.tx(diagnosis.status === "verified" ? "Misconception" : "Possible misconception")}</dt>
            <dd className="mt-0.5">{i18n.tx(misconception.statement)}</dd>
          </div>
        )}
        {topic && (
          <div>
            <dt className="text-muted">{i18n.t("Recommended foundation")}</dt>
            <dd className="mt-0.5 font-medium">{i18n.tx(topic.title)}</dd>
          </div>
        )}
        <div className={topic ? "" : "sm:col-span-2"}>
          <dt className="text-muted">{i18n.t("Next action")}</dt>
          <dd className="mt-0.5">{i18n.tx(diagnosis.nextAction)}</dd>
        </div>
      </dl>
    </section>
  );
}
