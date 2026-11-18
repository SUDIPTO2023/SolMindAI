"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { commonMistake } from "@/lib/diagnosis-rules";
import { parseNumber } from "@/lib/physics-rules";
import { useServiceData } from "@/lib/use-service-data";
import { learningService } from "@/services/service-provider";
import { UnitSchema, type ForceProblem, type StudentResponse, type Unit } from "@/types/assessment";
import { useLanguage } from "@/i18n/use-language";

const HINT_LABEL = { concept: "Concept", formula: "Formula", step: "Step" } as const;

export function AnswerForm({
  problem,
  hintsUsed,
  pending,
  error,
  onHint,
  onSubmit,
}: {
  problem: ForceProblem;
  hintsUsed: number;
  pending: boolean;
  error: string | null;
  onHint: () => void;
  onSubmit: (r: StudentResponse) => void;
}) {
  const i18n = useLanguage();
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<Unit>(problem.unit);
  const [working, setWorking] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const loadHints = useCallback(() => learningService.getHints(problem.id), [problem.id]);
  const hints = useServiceData(loadHints);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseNumber(value) === null) {
      setFieldError("Enter your answer as a number, for example 2.5.");
      return;
    }
    setFieldError(null);
    onSubmit({ value: value.trim(), unit, working });
  };

  const fillMistake = () => {
    const m = commonMistake(problem);
    setValue(m.value);
    setUnit(m.unit);
    setWorking(m.working);
    setFieldError(null);
  };

  return (
    <form onSubmit={submit} className="panel flex flex-col gap-4 p-6" noValidate>
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <label className="text-sm font-medium">{i18n.t("Your answer")}<input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            placeholder={i18n.t("e.g. 2.5")}
            aria-invalid={!!fieldError}
            aria-describedby={fieldError ? "answer-error" : undefined}
            className="mt-1.5 h-11 w-full rounded-md border border-line-strong bg-base px-3 font-mono text-text focus:border-purple focus:outline-none aria-[invalid=true]:border-error"
          />
        </label>
        <label className="text-sm font-medium">{i18n.t("Unit")}<select
            value={unit}
            onChange={(e) => setUnit(UnitSchema.parse(e.target.value))}
            className="mt-1.5 h-11 w-full rounded-md border border-line-strong bg-base px-3 text-text focus:border-purple focus:outline-none"
          >
            {UnitSchema.options.map((u) => <option key={u}>{i18n.tx(u)}</option>)}
          </select>
        </label>
      </div>
      {fieldError && <p id="answer-error" role="alert" className="-mt-2 text-sm text-bad-ink">{i18n.tx(fieldError)}</p>}

      <label className="text-sm font-medium">{i18n.t("Your working")}{" "}<span className="font-normal text-muted">{i18n.t("(optional, but it helps find the cause)")}</span>
        <textarea
          value={working}
          onChange={(e) => setWorking(e.target.value)}
          rows={4}
          placeholder={i18n.tx("F = …\na = …")}
          className="mt-1.5 w-full resize-y rounded-md border border-line-strong bg-base px-3 py-2.5 font-mono text-[15px] leading-relaxed text-text focus:border-purple focus:outline-none"
        />
      </label>

      <div>
        <Button type="button" variant="secondary" onClick={onHint} disabled={hintsUsed >= 3 || !hints.data} className="w-full">
          <Lightbulb size={16} aria-hidden="true" />
          {i18n.tx(hintsUsed >= 3 ? "All hints shown" : `Get a hint (${hintsUsed} of 3 used)`)}
        </Button>
        <AnimatePresence initial={false}>
          {hints.data?.slice(0, hintsUsed).map((h) => (
            <motion.div
              key={h.level}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <p className="mt-2 rounded-md border border-warning/30 bg-warning/[0.07] px-3 py-2 text-sm">
                <span className="font-medium text-warn-ink">{i18n.t("Hint")}{" "}{h.level}, {i18n.tx(HINT_LABEL[h.kind])}: </span>
                {i18n.tx(h.text)}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {hintsUsed > 0 && <p className="mt-2 text-xs text-muted">{i18n.t("Hints are recorded. They are a learning signal, not a penalty.")}</p>}
      </div>

      {error && <p role="alert" className="text-sm text-bad-ink">{i18n.tx(error)}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (
          <><LoaderCircle size={17} className="animate-spin" aria-hidden="true" />{" "}{i18n.t("Checking your working")}</>
        ) : (
          i18n.tx("Check my answer")
        )}
      </Button>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="flex items-center gap-2 text-xs text-muted">
          <Badge>{i18n.t("Demo")}</Badge>{" "}{i18n.t("Fill in the most common mistake")}</span>
        <button type="button" onClick={fillMistake} className="text-sm text-accent hover:underline">{i18n.t("Use sample answer")}</button>
      </div>
    </form>
  );
}
