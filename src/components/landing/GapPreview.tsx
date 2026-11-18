"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle } from "lucide-react";
import { ValidationCheckList } from "@/components/assessment/ValidationCheckList";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GAP_CASES } from "@/data/demo-scenarios";
import { MAIN_DIAGNOSTIC } from "@/data/questions";
import { misconceptionById } from "@/data/misconceptions";
import { TOPICS } from "@/data/topics";
import { learningService } from "@/services/service-provider";
import type { DiagnosticEvaluation, GapType, Unit } from "@/types/assessment";
import { UnitSchema } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const GAP_LABEL: Record<GapType, { label: string; tone: BadgeTone }> = {
  conceptual: { label: "Conceptual gap", tone: "error" },
  mathematical: { label: "Mathematical gap", tone: "warning" },
  mixed: { label: "Mixed gap", tone: "purple" },
  none: { label: "No identified gap", tone: "success" },
  insufficient_evidence: { label: "Insufficient evidence", tone: "cyan" },
};

const STATUS_LABEL = {
  suspected: "Suspected: needs a follow-up",
  verified: "Verified from the working",
  uncertain: "Uncertain",
  not_applicable: "Nothing to confirm",
} as const;

const topicTitle = (id: string | null) => TOPICS.find((t) => t.id === id)?.title ?? null;

export function GapPreview() {
  const i18n = useLanguage();
  const [tab, setTab] = useState(0);
  const [value, setValue] = useState(GAP_CASES[0].response.value);
  const [unit, setUnit] = useState<Unit>(GAP_CASES[0].response.unit);
  const [working, setWorking] = useState(GAP_CASES[0].response.working);
  const [result, setResult] = useState<DiagnosticEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const kase = GAP_CASES[tab];

  const selectTab = (i: number) => {
    setTab(i);
    setValue(GAP_CASES[i].response.value);
    setUnit(GAP_CASES[i].response.unit);
    setWorking(GAP_CASES[i].response.working);
    setResult(null);
    setError(null);
  };

  const run = async () => {
    if (!value.trim()) {
      setError("Enter the student’s final answer first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await learningService.evaluateDiagnostic(MAIN_DIAGNOSTIC.id, { value, unit, working }));
    } catch {
      setError("The check could not run. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const edited =
    value !== kase.response.value || unit !== kase.response.unit || working !== kase.response.working;
  const misconception = misconceptionById(result?.possibleMisconceptionId ?? null);
  const recommended = topicTitle(result?.recommendedTopicId ?? null);

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <SectionHeading
            kicker="Interactive preview"
            title="Run the gap check yourself"
            lead="Pick a student, then check their working. Edit the steps to see how the diagnosis changes. These checks use fixed rules in your browser, not an AI model."
          />
        </Reveal>

        <div role="tablist" aria-label={i18n.t("Student examples")} className="mt-10 inline-flex rounded-lg border border-line bg-ink/[0.02] p-1">
          {GAP_CASES.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              id={`gap-tab-${c.id}`}
              aria-selected={tab === i}
              aria-controls="gap-panel"
              onClick={() => selectTab(i)}
              className="relative rounded-md px-4 py-2 text-sm font-medium"
            >
              {tab === i && (
                <motion.span layoutId="gap-tab" className="absolute inset-0 rounded-md bg-elevated" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className={cn("relative", tab === i ? "text-text" : "text-muted")}>{i18n.tx(c.tab)}</span>
            </button>
          ))}
        </div>

        <div id="gap-panel" role="tabpanel" aria-labelledby={`gap-tab-${kase.id}`} className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* student response */}
          <form
            className="panel flex flex-col gap-4 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              void run();
            }}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{i18n.tx(kase.student)}{i18n.t("’s response")}</p>
              {edited && (
                <button type="button" onClick={() => selectTab(tab)} className="text-sm text-accent hover:underline">{i18n.t("Restore original")}</button>
              )}
            </div>
            <p className="text-sm text-muted">{i18n.tx(MAIN_DIAGNOSTIC.prompt)}</p>
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <label className="text-sm text-muted">{i18n.t("Final answer")}<input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  inputMode="decimal"
                  className="mt-1.5 h-11 w-full rounded-md border border-line-strong bg-base px-3 font-mono text-text focus:border-purple focus:outline-none"
                />
              </label>
              <label className="text-sm text-muted">{i18n.t("Unit")}<select
                  value={unit}
                  onChange={(e) => setUnit(UnitSchema.parse(e.target.value))}
                  className="mt-1.5 h-11 w-full rounded-md border border-line-strong bg-base px-3 text-text focus:border-purple focus:outline-none"
                >
                  {UnitSchema.options.map((u) => (
                    <option key={u}>{i18n.tx(u)}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="text-sm text-muted">{i18n.t("Working")}<textarea
                value={working}
                onChange={(e) => setWorking(e.target.value)}
                rows={4}
                className="mt-1.5 w-full resize-y rounded-md border border-line-strong bg-base px-3 py-2.5 font-mono text-[15px] leading-relaxed text-text focus:border-purple focus:outline-none"
              />
            </label>
            {error && <p role="alert" className="text-sm text-bad-ink">{i18n.tx(error)}</p>}
            <Button type="submit" size="lg" disabled={loading} className="mt-auto">
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />{" "}{i18n.t("Checking the working")}</>
              ) : (
                i18n.tx("Check this working")
              )}
            </Button>
          </form>

          {/* diagnosis */}
          <div className="panel min-h-[420px] p-6" aria-live="polite">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid h-full min-h-[360px] place-items-center text-center"
                >
                  <div className="max-w-xs">
                    <p className="font-medium">{i18n.tx(loading ? "Reading each step…" : "No check run yet")}</p>
                    <p className="mt-2 text-sm text-muted">
                      {i18n.tx(loading
                        ? "Formula, net force, arithmetic and unit are checked separately."
                        : "Run the check to see the evidence and the diagnosis for this response.")}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={`${tab}-${result.gapType}-${working}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ValidationCheckList checks={result.checks} />

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: result.checks.length * 0.12 + 0.1 }}
                    className="mt-6 border-t border-line pt-5"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={GAP_LABEL[result.gapType].tone}>{i18n.tx(GAP_LABEL[result.gapType].label)}</Badge>
                      <Badge>{i18n.tx(STATUS_LABEL[result.status])}</Badge>
                      <Badge>{i18n.t("Confidence:")}{" "}{i18n.tx(result.confidence)}</Badge>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      {misconception && (
                        <div className="sm:col-span-2">
                          <dt className="text-muted">{i18n.t("Possible misconception")}</dt>
                          <dd>{i18n.tx(misconception.statement)}</dd>
                        </div>
                      )}
                      {recommended && (
                        <div>
                          <dt className="text-muted">{i18n.t("Recommended foundation")}</dt>
                          <dd>{i18n.tx(recommended)}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-muted">{i18n.t("Next action")}</dt>
                        <dd>{i18n.tx(result.nextAction)}</dd>
                      </div>
                    </dl>

                    {!edited && (
                      <div className="mt-5 rounded-md border border-line bg-base/50 p-4">
                        <p className="text-sm font-medium">{i18n.t("Targeted learning:")}{" "}{i18n.tx(kase.intervention.title)}</p>
                        <ol className="mt-2 space-y-1 text-sm text-muted">
                          {kase.intervention.steps.map((s, i) => (
                            <li key={s}>
                              <span className="font-mono text-xs text-accent">{i + 1}.</span> {i18n.tx(s)}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
