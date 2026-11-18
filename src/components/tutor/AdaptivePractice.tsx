"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { Formula } from "@/components/ui/Formula";
import { StatusPill } from "@/components/ui/StatusPill";
import { parseNumber } from "@/lib/physics-rules";
import { useLearningStore } from "@/store/learning-store";
import { DifficultySchema, UnitSchema, type Unit } from "@/types/assessment";
import type { Topic } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const LEVELS = DifficultySchema.options;

/** Adaptive challenge: the next question depends on the last answer. */
export function AdaptivePractice({ topics }: { topics: Topic[] }) {
  const i18n = useLanguage();
  const practice = useLearningStore((s) => s.practice);
  const mastery = useLearningStore((s) => s.mastery);
  const start = useLearningStore((s) => s.startPractice);
  const submit = useLearningStore((s) => s.submitPracticeAnswer);
  const next = useLearningStore((s) => s.nextPractice);
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<Unit>("m/s²");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const q = practice.current;
  const title = (id: string) => topics.find((t) => t.id === id)?.title ?? id;

  if (!q && !practice.done) {
    return (
      <section className="panel bg-grid p-8 text-center">
        <h2 className="text-2xl font-semibold">{i18n.t("A new question, not the same one again")}</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">{i18n.t("You start at the level of the diagnostic. A correct answer moves you up a level. A miss steps back to the foundation first.")}</p>
        {practice.error && <p role="alert" className="mt-3 text-sm text-bad-ink">{i18n.tx(practice.error)}</p>}
        <Button size="lg" className="mt-6" onClick={() => void start()} disabled={practice.pending}>
          {practice.pending ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />{" "}{i18n.t("Choosing a question")}</> : "Start practice"}
        </Button>
      </section>
    );
  }

  if (practice.done) {
    return (
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
        <Badge tone="success">{i18n.t("Practice complete")}</Badge>
        <h2 className="mt-4 text-2xl font-semibold">{i18n.t("Here is what your answers changed")}</h2>
        <ul className="mt-5 space-y-3">
          {["net-force", "friction", "second-law"].map((id, i) => (
            <motion.li key={id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.2 }} className="flex flex-wrap items-center gap-3 text-sm">
              <span className="w-44 font-medium">{i18n.tx(title(id))}</span>
              <StatusPill status={mastery.find((m) => m.topicId === id)?.status ?? "not_assessed"} />
            </motion.li>
          ))}
        </ul>
        <ul className="mt-5 space-y-1 text-sm text-muted">
          {practice.results.map((r, i) => (
            <li key={`${r.id}-${i}`}>{i18n.t("Question")}{" "}{i + 1}: {i18n.tx(r.correct ? "correct" : "missed")}{" "}{i18n.t("(you answered")}{" "}{i18n.tx(r.given)} {i18n.tx(r.unit)})</li>
          ))}
        </ul>
        <p className="mt-4 max-w-xl text-sm text-muted">{i18n.t("Nothing is marked Mastered yet. That needs correct answers on more than one occasion.")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/knowledge-map" className={buttonClass({ size: "lg" })}>{i18n.t("See the updated Knowledge Map")}</Link>
          <Link href="/analytics" className={buttonClass({ size: "lg", variant: "secondary" })}>{i18n.t("Open Analytics")}</Link>
        </div>
      </motion.section>
    );
  }

  if (!q) return null;
  const level = LEVELS.indexOf(q.difficulty);
  const answer = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseNumber(value) === null) {
      setFieldError("Enter your answer as a number.");
      return;
    }
    setFieldError(null);
    void submit(value.trim(), unit);
  };

  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <p className="mb-3 text-sm text-muted">{i18n.t("Difficulty level")}</p>
        <ol className="grid grid-cols-4 gap-2">
          {LEVELS.map((d, i) => (
            <li key={d} className="relative rounded-md px-2 py-2 text-center text-sm font-medium">
              {i === level && (
                <motion.span layoutId="practice-level" className="absolute inset-0 rounded-md bg-[image:var(--gradient-primary)]" transition={{ type: "spring", stiffness: 300, damping: 28 }} />
              )}
              <span className={cn("relative", i === level ? "text-white" : "text-muted")}>{i18n.tx(d)}</span>
            </li>
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={q.id}
          initial={{ opacity: 0, x: 60, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -60, rotateY: 8 }}
          transition={{ duration: 0.35 }}
          className="panel p-6"
        >
          <div className="flex flex-wrap gap-2">
            <Badge>{i18n.t("Topic:")}{" "}{i18n.tx(title(q.topicId))}</Badge>
            <Badge tone="warning">{i18n.t("Difficulty:")}{" "}{i18n.tx(q.difficulty)}</Badge>
            <Badge tone="purple">{i18n.t("Bloom:")}{" "}{i18n.tx(q.bloom)}</Badge>
            <Badge tone="cyan">{i18n.t("Independent, no hints")}</Badge>
          </div>
          <p className="mt-4 text-sm text-muted"><span className="font-medium text-text">{i18n.t("Why this question:")}{" "}</span>{i18n.tx(q.why)}</p>
          <h2 className="mt-3 text-xl font-semibold leading-snug sm:text-2xl">{i18n.tx(q.prompt)}</h2>

          <form onSubmit={answer} className="mt-5 flex flex-wrap items-end gap-3" noValidate>
            <label className="flex flex-col text-sm font-medium">{i18n.t("Your answer")}<input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={practice.answered}
                inputMode="decimal"
                aria-invalid={!!fieldError}
                className="mt-1.5 h-11 w-36 rounded-md border border-line-strong bg-base px-3 font-mono text-text focus:border-purple focus:outline-none disabled:opacity-60"
              />
            </label>
            <label className="flex flex-col text-sm font-medium">{i18n.t("Unit")}<select
                value={unit}
                onChange={(e) => setUnit(UnitSchema.parse(e.target.value))}
                disabled={practice.answered}
                className="mt-1.5 h-11 w-28 rounded-md border border-line-strong bg-base px-3 text-text focus:border-purple focus:outline-none disabled:opacity-60"
              >
                {UnitSchema.options.map((u) => <option key={u}>{i18n.tx(u)}</option>)}
              </select>
            </label>
            {!practice.answered && (
              <Button type="submit" size="lg" disabled={practice.pending}>
                {practice.pending ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />{" "}{i18n.t("Checking")}</> : i18n.tx("Check answer")}
              </Button>
            )}
          </form>
          {fieldError && <p role="alert" className="mt-2 text-sm text-bad-ink">{i18n.tx(fieldError)}</p>}
          {practice.error && <p role="alert" className="mt-2 text-sm text-bad-ink">{i18n.tx(practice.error)}</p>}

          {practice.answered && practice.feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("mt-5 rounded-md border p-4", practice.feedback.correct ? "border-success/50 bg-success/[0.08]" : "border-error/50 bg-error/[0.08]")}
              aria-live="polite"
            >
              <p className="font-semibold">{i18n.tx(practice.feedback.text)}</p>
              <div className="mt-2 overflow-x-auto"><Formula tex={q.solutionTex} /></div>
              <Button
                className="mt-4"
                disabled={practice.pending}
                onClick={() => {
                  setValue("");
                  setUnit("m/s²");
                  void next();
                }}
              >{i18n.t("Next")}{" "}<ArrowRight size={16} aria-hidden="true" />
              </Button>
            </motion.div>
          )}
        </motion.section>
      </AnimatePresence>
      <p className="text-xs text-muted">{i18n.t("The next question is chosen by a fixed, visible rule from your last answer.")}</p>
    </div>
  );
}
