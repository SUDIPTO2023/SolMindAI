"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { modeById } from "@/data/onboarding";
import { useServiceData } from "@/lib/use-service-data";
import { learningService } from "@/services/service-provider";
import { useLearningStore } from "@/store/learning-store";
import { AnswerForm } from "./AnswerForm";
import { AssessmentStepper } from "./AssessmentStepper";
import { BlockDiagram } from "./BlockDiagram";
import { DiagnosisCard } from "./DiagnosisCard";
import { FollowUpPanel } from "./FollowUpPanel";
import { MasteryChanges } from "./MasteryChanges";
import { ReadinessCheck } from "./ReadinessCheck";
import { SolutionSteps } from "./SolutionSteps";
import { ValidationCheckList } from "./ValidationCheckList";
import { useLanguage } from "@/i18n/use-language";

const loadContent = learningService.getDiagnosticContent;

const READINESS_TEXT = { ready: "Ready", partially_ready: "Partially ready", foundation_needed: "Foundation needed" } as const;

/** Page 04: the full diagnostic flow, driven by the shared store. */
export function DiagnosticAssessment() {
  const i18n = useLanguage();
  const content = useServiceData(loadContent);
  const s = useLearningStore();
  const a = s.assessment;
  const mode = modeById(s.learningMode);

  if (content.loading) {
    return (
      <div role="status" aria-label={i18n.t("Loading the assessment")} className="space-y-4">
        <div className="h-8 w-72 animate-pulse rounded-md bg-ink/[0.06]" />
        <div className="h-64 animate-pulse rounded-lg bg-ink/[0.04]" />
      </div>
    );
  }
  if (content.error || !content.data) {
    return (
      <EmptyState icon={ClipboardCheck} title="The assessment could not load" body="Nothing was lost. Try loading it again.">
        <Button onClick={content.retry}><RefreshCw size={16} aria-hidden="true" />{" "}{i18n.t("Try again")}</Button>
      </EmptyState>
    );
  }

  const { questions, readiness, misconceptions, topics } = content.data;
  const problem = questions[a.questionIndex % questions.length];
  const evaluation = a.evaluation;
  const result = a.result;

  return (
    <>
      <PageHeader
        title="Diagnostic Assessment"
        description="SOLMIND looks at how you reached your answer, not only whether it is right."
        actions={
          <>
            {a.readiness && <Badge tone="cyan">{i18n.t("Readiness:")}{" "}{i18n.tx(READINESS_TEXT[a.readiness])}</Badge>}
            <Badge>{i18n.t("Question")}{" "}{(a.questionIndex % questions.length) + 1}{" "}{i18n.t("of")}{" "}{questions.length}</Badge>
          </>
        }
      />

      {s.learningMode === "advanced_challenge" && a.phase !== "complete" && (
        <p className="mb-5 flex items-start gap-2 rounded-md border border-cyan/30 bg-cyan/[0.06] px-4 py-3 text-sm">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-cyan-ink" aria-hidden="true" />{i18n.t("You chose Advanced Challenge. This diagnostic verifies your foundations before harder problems unlock.")}</p>
      )}

      <AssessmentStepper phase={a.phase} />

      <AnimatePresence mode="wait">
        <motion.div
          key={a.phase === "followup" ? "evaluated" : a.phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {a.phase === "readiness" && (
            <ReadinessCheck
              questions={readiness}
              answers={a.readinessAnswers}
              mode={s.learningMode}
              onAnswer={s.answerReadiness}
              onFinish={() => s.finishReadiness(readiness)}
            />
          )}

          {a.phase === "question" && (
            <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
              <section className="panel p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge>{i18n.t("Topic: Newton’s Second Law")}</Badge>
                  <Badge tone="warning">{i18n.t("Difficulty:")}{" "}{i18n.tx(problem.difficulty)}</Badge>
                  <Badge tone="purple">{i18n.t("Bloom:")}{" "}{i18n.tx(problem.bloom)}</Badge>
                </div>
                <h2 className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">{i18n.tx(problem.prompt)}</h2>
                <div className="bg-grid mt-5 rounded-md border border-line p-4">
                  <BlockDiagram problem={problem} />
                </div>
                <p className="mt-4 text-xs text-muted">{i18n.t("Source:")}{" "}{i18n.tx(problem.curriculumRef)}{i18n.t(". Curated demo question.")}</p>
              </section>
              <AnswerForm
                key={problem.id}
                problem={problem}
                hintsUsed={a.hintsUsed}
                pending={a.pending}
                error={a.error}
                onHint={s.recordHintUsage}
                onSubmit={(r) => void s.submitAnswer(problem, r)}
              />
            </div>
          )}

          {(a.phase === "evaluated" || a.phase === "followup") && evaluation && (
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <section className="panel p-6">
                <p className="text-sm text-muted">{i18n.t("You answered")}</p>
                <p className="mt-1 font-mono text-3xl">
                  {i18n.tx(a.response?.value)} {i18n.tx(a.response?.unit)}
                </p>
                {a.response?.working && (
                  <pre className="mt-3 whitespace-pre-wrap rounded-md border border-line bg-base/60 px-3 py-2 font-mono text-sm text-muted">
                    {a.response.working}
                  </pre>
                )}
                <h2 className="mt-6 font-semibold">{i18n.t("Mathematical validation")}</h2>
                <div className="mt-3">
                  <ValidationCheckList checks={evaluation.checks} stagger={0.35} />
                </div>
                <p className="mt-5 text-xs text-muted">{i18n.t("Checked with fixed rules in your browser, not an AI model.")}</p>
              </section>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: a.phase === "evaluated" ? evaluation.checks.length * 0.35 + 0.2 : 0 }}
              >
                {a.phase === "evaluated" ? (
                  <>
                    <DiagnosisCard
                      diagnosis={{ ...evaluation, misconceptionId: evaluation.possibleMisconceptionId }}
                      misconceptions={misconceptions}
                      topics={topics}
                    />
                    <div className="panel flex flex-wrap items-center justify-between gap-4 bg-elevated p-5">
                      <p className="max-w-sm text-sm text-muted">{i18n.t("A wrong number alone doesn’t say why it is wrong. One short question will, before anything is marked.")}</p>
                      <Button size="lg" onClick={s.startFollowUp}>{i18n.t("Answer the follow-up question")}</Button>
                    </div>
                  </>
                ) : (
                  a.followUp && (
                    <FollowUpPanel
                      followUp={a.followUp}
                      pending={a.pending}
                      error={a.error}
                      onAnswer={(id) => void s.submitFollowUp(problem, id)}
                    />
                  )
                )}
              </motion.div>
            </div>
          )}

          {a.phase === "complete" && result && evaluation && (
            <div className="space-y-4">
              <DiagnosisCard diagnosis={result} misconceptions={misconceptions} topics={topics} />
              <div className="grid gap-4 lg:grid-cols-2">
                <SolutionSteps problem={problem} checks={evaluation.checks} />
                <div className="space-y-4">
                  <MasteryChanges before={a.masteryBefore ?? s.mastery} after={s.mastery} topics={topics} />
                  <section className="panel p-6">
                    <h2 className="font-semibold">{i18n.t("Answer checks")}</h2>
                    <div className="mt-3">
                      <ValidationCheckList checks={evaluation.checks} stagger={0.05} />
                    </div>
                    <p className="mt-4 text-xs text-muted">{i18n.t("Hints used:")}{" "}{a.hintsUsed}{" "}{i18n.t("of 3")}</p>
                  </section>
                </div>
              </div>
              <div className="panel flex flex-wrap items-center gap-3 p-5">
                <Link href="/tutor" className={buttonClass({ size: "lg" })}>{i18n.t("Learn with SOLMIND AI")}</Link>
                <Link href="/knowledge-map" className={buttonClass({ size: "lg", variant: "secondary" })}>{i18n.t("View Knowledge Map")}</Link>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => s.startAssessment({ nextQuestion: true, questionCount: questions.length })}
                >
                  <RefreshCw size={16} aria-hidden="true" />{" "}{i18n.t("Try Another Question")}</Button>
                {mode && <span className="ml-auto text-xs text-muted">{i18n.t("Mode:")}{" "}{i18n.tx(mode.title)}</span>}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
