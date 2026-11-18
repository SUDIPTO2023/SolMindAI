"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { readinessLevel } from "@/lib/diagnosis-rules";
import type { ChoiceQuestion, ReadinessLevel } from "@/types/assessment";
import type { LearningMode } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const RESULT: Record<ReadinessLevel, { title: string; body: string; tone: "success" | "warning" | "error" }> = {
  ready: { title: "Ready", body: "Both ideas Newton’s second law depends on are in place.", tone: "success" },
  partially_ready: {
    title: "Partially ready",
    body: "One of the two ideas needs attention. You can continue, and the next question will show where.",
    tone: "warning",
  },
  foundation_needed: {
    title: "Foundation needed",
    body: "The ideas this topic builds on need work first. You can learn them now, or try the question so SOLMIND can see exactly where to start.",
    tone: "error",
  },
};

export function ReadinessCheck({
  questions,
  answers,
  mode,
  onAnswer,
  onFinish,
}: {
  questions: ChoiceQuestion[];
  answers: Record<string, string>;
  mode: LearningMode | null;
  onAnswer: (q: ChoiceQuestion, optionId: string) => void;
  onFinish: () => void;
}) {
  const i18n = useLanguage();
  const answered = questions.filter((q) => answers[q.id]).length;
  const correct = questions.filter((q) => q.options.find((o) => o.id === answers[q.id])?.correct).length;
  const done = answered === questions.length;
  const level = readinessLevel(correct, questions.length);

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-muted">
        {i18n.tx(mode === "advanced_challenge"
          ? "Advanced problems unlock once your foundations are verified. Two quick questions check the ideas Newton’s second law depends on."
          : "Newton’s second law builds on force and net force. Two quick questions check those first.")}
      </p>

      {questions.map((q, qi) => {
        if (qi > 0 && !answers[questions[qi - 1].id]) return null;
        const picked = answers[q.id];
        return (
          <motion.section key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
            <div className="flex flex-wrap gap-2">
              <Badge>{i18n.t("Prerequisite")}{" "}{qi + 1}{" "}{i18n.t("of")}{" "}{questions.length}</Badge>
              <Badge>{i18n.t("Difficulty:")}{" "}{i18n.tx(q.difficulty)}</Badge>
              <Badge tone="purple">{i18n.t("Bloom:")}{" "}{i18n.tx(q.bloom)}</Badge>
            </div>
            <h2 className="mt-4 max-w-2xl text-lg font-semibold leading-snug">{i18n.tx(q.prompt)}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-label={i18n.t("Answer options")}>
              {q.options.map((o) => {
                const show = !!picked;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={show}
                    onClick={() => onAnswer(q, o.id)}
                    className={cn(
                      "rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors",
                      !show && "border-line bg-surface hover:border-purple/60",
                      show && o.correct && "border-success/60 bg-success/10",
                      show && !o.correct && o.id === picked && "border-error/60 bg-error/10",
                      show && !o.correct && o.id !== picked && "border-line opacity-50",
                    )}
                  >
                    {i18n.tx(o.label)}
                    {show && o.correct && <span className="sr-only">{" "}{i18n.t("(correct answer)")}</span>}
                    {show && !o.correct && o.id === picked && <span className="sr-only">{" "}{i18n.t("(your answer, incorrect)")}</span>}
                  </button>
                );
              })}
            </div>
            {picked && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-muted" aria-live="polite">
                {i18n.tx(q.options.find((o) => o.id === picked)?.correct ? "Correct. " : "Not quite. ")}
                {i18n.tx(q.explanation)}
              </motion.p>
            )}
          </motion.section>
        );
      })}

      {done && (
        <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="panel bg-grid p-6" aria-live="polite">
          <p className="text-sm text-muted">{i18n.t("Readiness for Newton’s Second Law")}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold">{i18n.tx(RESULT[level].title)}</h2>
            <Badge tone={RESULT[level].tone}>{correct}{" "}{i18n.t("of")}{" "}{questions.length}{" "}{i18n.t("correct")}</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-muted">{i18n.tx(RESULT[level].body)}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {level === "foundation_needed" && (
              <Link href="/tutor" className={buttonClass({ size: "lg" })}>{i18n.t("Learn the foundation first")}</Link>
            )}
            <Button size="lg" variant={level === "foundation_needed" ? "secondary" : "primary"} onClick={onFinish}>
              {i18n.tx(level === "foundation_needed" ? "Try the question anyway" : "Continue to the diagnostic question")}
            </Button>
          </div>
        </motion.section>
      )}
    </div>
  );
}
