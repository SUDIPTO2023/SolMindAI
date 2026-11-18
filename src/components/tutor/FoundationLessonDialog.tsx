"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Formula } from "@/components/ui/Formula";
import type { LearningPreferences } from "@/types/learning";
import type { FoundationLesson } from "@/types/tutoring";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

type Part = "definition" | "example" | "concept" | "formula" | "worked" | "check";
const LABEL: Record<Part, string> = {
  definition: "In plain words",
  example: "Real life",
  concept: "The idea",
  formula: "Formula",
  worked: "Worked example",
  check: "Your turn",
};

/** Zero-level concept builder: explains net force from the ground up, then checks it. */
export function FoundationLessonDialog({
  open,
  onClose,
  lesson,
  prefs,
  done,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  lesson: FoundationLesson;
  prefs: LearningPreferences;
  done: boolean;
  onComplete: (correct: boolean) => void;
}) {
  const i18n = useLanguage();
  const parts: Part[] = prefs.explanationStart === "formula_first"
    ? ["definition", "formula", "example", "concept", "worked", "check"]
    : ["definition", "example", "concept", "formula", "worked", "check"];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const part = parts[index];

  return (
    <Dialog open={open} onClose={onClose} title={lesson.title} description="Zero-level concept builder" className="max-w-2xl">
      <ol className="mt-5 grid grid-cols-6 gap-1.5" aria-label={i18n.t("Lesson parts")}>
        {parts.map((p, i) => (
          <li key={p}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
              className={cn("w-full border-t-2 pt-1.5 text-left text-[11px] leading-tight", i <= index ? "border-purple text-text" : "border-line text-muted")}
            >
              {i18n.tx(LABEL[p])}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 min-h-[230px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={part}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {part === "definition" && <p className="text-xl leading-relaxed">{i18n.tx(lesson.definition)}</p>}
            {part === "example" && (
              <>
                <p className="text-lg leading-relaxed">{i18n.tx(lesson.example)}</p>
                <svg viewBox="0 0 400 76" className="mt-5 w-full" role="img" aria-label={i18n.t("A rope pulled with 500 newtons to the left and 450 newtons to the right, leaving 50 newtons to the left.")}>
                  <line x1="60" y1="36" x2="340" y2="36" stroke="var(--color-muted)" strokeWidth="3" />
                  <path d="M 190 36 H 40 M 40 36 l 12 -8 M 40 36 l 12 8" stroke="#3B82F6" strokeWidth="4" fill="none" />
                  <path d="M 210 36 H 360 M 360 36 l -12 -8 M 360 36 l -12 8" stroke="#EF4444" strokeWidth="4" fill="none" />
                  <text x="100" y="20" fill="var(--color-blue-soft)" fontSize="14" fontWeight="600">{i18n.t("500 N")}</text>
                  <text x="270" y="20" fill="var(--color-bad-soft)" fontSize="14" fontWeight="600">{i18n.t("450 N")}</text>
                  <text x="200" y="68" textAnchor="middle" fill="var(--color-ok-soft)" fontSize="14" fontWeight="600">{i18n.t("Net: 50 N to the left")}</text>
                </svg>
              </>
            )}
            {part === "concept" && <p className="text-lg leading-relaxed">{i18n.tx(lesson.concept)}</p>}
            {part === "formula" && (
              <div className="space-y-4">
                {lesson.formulas.map((f) => (
                  <div key={f.label}>
                    <p className="text-sm text-muted">{i18n.tx(f.label)}</p>
                    <div className="mt-1.5 overflow-x-auto rounded-md border border-line bg-base/60 px-4 py-3 text-lg">
                      <Formula tex={f.tex} display />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {part === "worked" && (
              <>
                <p className="text-lg">{i18n.tx(lesson.worked.prompt)}</p>
                <ol className="mt-4 space-y-2">
                  {lesson.worked.steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink/[0.06] font-mono text-xs">{i + 1}</span>
                      <span className="overflow-x-auto rounded-md border border-line bg-base/60 px-3 py-2"><Formula tex={s} /></span>
                    </li>
                  ))}
                </ol>
              </>
            )}
            {part === "check" && (
              <>
                <p className="text-lg font-medium">{i18n.tx(lesson.check.prompt)}</p>
                <div className="mt-4 grid gap-2" role="group" aria-label={i18n.t("Answer options")}>
                  {lesson.check.options.map((o) => {
                    const show = picked !== null;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        disabled={show}
                        onClick={() => {
                          setPicked(o.id);
                          if (!done) onComplete(o.correct);
                        }}
                        className={cn(
                          "rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors",
                          !show && "border-line bg-surface hover:border-purple/60",
                          show && o.correct && "border-success/60 bg-success/10",
                          show && !o.correct && o.id === picked && "border-error/60 bg-error/10",
                          show && !o.correct && o.id !== picked && "border-line opacity-50",
                        )}
                      >
                        {i18n.tx(o.label)}
                      </button>
                    );
                  })}
                </div>
                {picked && (
                  <p className="mt-3 text-sm text-muted" aria-live="polite">
                    {i18n.tx(lesson.check.options.find((o) => o.id === picked)?.correct ? "Correct. " : "Not quite. ")}
                    {i18n.tx(lesson.check.explanation)}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs text-muted" title={i18n.tx(lesson.source)}>{i18n.t("Curated lesson content, not AI-generated.")}</p>
        <div className="flex shrink-0 gap-2">
          {index > 0 && <Button variant="ghost" onClick={() => setIndex(index - 1)}>{i18n.t("Back")}</Button>}
          {index < parts.length - 1 ? (
            <Button onClick={() => setIndex(index + 1)}>{i18n.t("Next")}</Button>
          ) : (
            <Button onClick={onClose} disabled={picked === null && !done}>{i18n.t("Back to the tutor")}</Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
