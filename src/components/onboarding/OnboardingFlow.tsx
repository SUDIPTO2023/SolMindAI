"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Rocket, Sprout, Target, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DEFAULT_PREFERENCES, LEARNING_MODES, OBJECTIVES, PREFERENCE_OPTIONS, modeById, objectiveById } from "@/data/onboarding";
import { useLearningStore } from "@/store/learning-store";
import { StudentNameSchema, type LearningMode, type LearningObjective, type LearningPreferences } from "@/types/learning";
import { cn } from "@/lib/utils";
import { ChoiceCard, radioKeys } from "./ChoiceCard";
import { useLanguage } from "@/i18n/use-language";

const STEPS = ["Profile", "Learning mode", "Goal", "Review"];
const MODE_ICON: Record<LearningMode, LucideIcon> = {
  learn_from_zero: Sprout,
  practice_and_improve: Target,
  advanced_challenge: Rocket,
};

export function OnboardingFlow() {
  const i18n = useLanguage();
  const router = useRouter();
  const store = useLearningStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState(store.profile.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [mode, setMode] = useState<LearningMode | null>(store.learningMode);
  const [objective, setObjective] = useState<LearningObjective | null>(store.objective);
  const [prefs, setPrefs] = useState<LearningPreferences>(store.onboardingComplete ? store.preferences : DEFAULT_PREFERENCES);
  const [attempted, setAttempted] = useState(false);

  const chooseMode = (m: LearningMode) => {
    setMode(m);
    store.setLearningMode(m); // the chosen mode updates the shared state immediately
  };

  const stepError =
    step === 0 ? nameError : step === 1 && !mode ? "Choose a learning mode to continue." : step === 2 && !objective ? "Choose a learning goal to continue." : null;

  const go = (to: number) => {
    setDirection(to > step ? 1 : -1);
    setAttempted(false);
    setStep(to);
  };

  const next = () => {
    if (step === 0) {
      const parsed = StudentNameSchema.safeParse(name);
      if (!parsed.success) {
        setNameError(parsed.error.issues[0]?.message ?? "Check the name.");
        return;
      }
    }
    if (stepError) {
      setAttempted(true);
      return;
    }
    go(step + 1);
  };

  const finish = (target: "/assessment/diagnostic" | "/dashboard") => {
    if (!mode || !objective) return;
    store.completeOnboarding({ name, mode, objective, preferences: prefs });
    router.push(target);
  };

  const chosenMode = modeById(mode);
  const chosenObjective = objectiveById(objective);

  return (
    <div className="flex min-h-[560px] flex-col">
      {/* progress indicator */}
      <ol className="grid grid-cols-4 gap-2" aria-label={i18n.t("Onboarding progress")}>
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <div className="h-1 overflow-hidden rounded-full bg-ink/10">
              <motion.div
                className="h-full bg-[image:var(--gradient-primary)]"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className={cn("mt-2 hidden text-xs sm:block", i <= step ? "text-text" : "text-muted")}>
              {i < step && <Check size={12} className="mr-1 inline text-ok-ink" aria-hidden="true" />}
              {i18n.tx(label)}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted sm:hidden">{i18n.t("Step")}{" "}{step + 1}{" "}{i18n.t("of")}{" "}{STEPS.length}: {i18n.tx(STEPS[step])}
      </p>

      <div className="relative mt-8 flex-1">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.section
            key={step}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 32 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -32 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-labelledby={`step-title-${step}`}
          >
            {step === 0 && (
              <div>
                <h1 id="step-title-0" className="text-3xl font-semibold sm:text-4xl">{i18n.t("Welcome to SOLMIND AI")}</h1>
                <p className="mt-3 max-w-lg text-muted">{i18n.t("A few quick choices set up your first session. You are using a guest demo profile, so nothing is saved to an account.")}</p>
                <label htmlFor="student-name" className="mt-8 block text-sm font-medium">{i18n.t("What should SOLMIND call you?")}</label>
                <input
                  id="student-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && next()}
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "name-error" : undefined}
                  className={cn(
                    "mt-2 h-12 w-full max-w-sm rounded-md border bg-base px-4 text-text focus:outline-none",
                    nameError ? "border-error" : "border-line-strong focus:border-purple",
                  )}
                />
                {nameError && <p id="name-error" role="alert" className="mt-2 text-sm text-bad-ink">{i18n.tx(nameError)}</p>}
                <dl className="mt-8 grid max-w-md grid-cols-3 gap-3 text-sm">
                  {[
                    ["Class", store.profile.className],
                    ["Subject", store.profile.subject],
                    ["Chapter", "Newton’s Laws"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border border-line bg-surface p-3">
                      <dt className="text-xs text-muted">{i18n.tx(k)}</dt>
                      <dd className="mt-0.5 font-medium">{i18n.tx(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 id="step-title-1" className="text-3xl font-semibold">{i18n.t("How would you like to learn?")}</h1>
                <p className="mt-3 max-w-lg text-muted">{i18n.t("This sets your first step. What you can actually do is worked out from your answers, not from this choice.")}</p>
                <div
                  role="radiogroup"
                  aria-label={i18n.t("Learning mode")}
                  className="mt-8 grid gap-3"
                  onKeyDown={radioKeys(LEARNING_MODES.map((m) => m.id), mode, chooseMode)}
                >
                  {LEARNING_MODES.map((m, i) => {
                    const Icon = MODE_ICON[m.id];
                    return (
                      <ChoiceCard
                        key={m.id}
                        checked={mode === m.id}
                        onSelect={() => chooseMode(m.id)}
                        layoutGroup="mode-dot"
                        className={cn(mode === null && i === 0 && "focus-visible:border-purple")}
                      >
                        <span className="flex items-start gap-4 pr-8">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink/[0.05] text-accent-soft">
                            <Icon size={20} aria-hidden="true" />
                          </span>
                          <span>
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-lg font-semibold">{i18n.tx(m.title)}</span>
                              <Badge>{i18n.tx(m.level)}</Badge>
                            </span>
                            <span className="mt-1 block text-muted">{i18n.tx(m.summary)}</span>
                          </span>
                        </span>
                      </ChoiceCard>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 id="step-title-2" className="text-3xl font-semibold">{i18n.t("What do you want from this chapter?")}</h1>
                <div
                  role="radiogroup"
                  aria-label={i18n.t("Learning goal")}
                  className="mt-8 grid gap-3 sm:grid-cols-3"
                  onKeyDown={radioKeys(OBJECTIVES.map((o) => o.id), objective, setObjective)}
                >
                  {OBJECTIVES.map((o) => (
                    <ChoiceCard key={o.id} checked={objective === o.id} onSelect={() => setObjective(o.id)} layoutGroup="goal-dot">
                      <span className="block pr-6 font-semibold">{i18n.tx(o.title)}</span>
                      <span className="mt-2 block text-sm text-muted">{i18n.tx(o.detail)}</span>
                    </ChoiceCard>
                  ))}
                </div>

                <h2 className="mt-10 text-lg font-semibold">{i18n.t("Learning preferences")}</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  {PREFERENCE_OPTIONS.map((p) => (
                    <fieldset key={p.key}>
                      <legend className="text-sm text-muted">{i18n.tx(p.question)}</legend>
                      <div className="mt-2 inline-flex w-full rounded-md border border-line bg-surface p-1">
                        {p.options.map((o) => {
                          const on = prefs[p.key] === o.value;
                          return (
                            <label key={o.value} className={cn("relative flex-1 cursor-pointer rounded px-3 py-2 text-center text-sm", on ? "text-text" : "text-muted hover:text-text")}>
                              <input
                                type="radio"
                                name={p.key}
                                value={o.value}
                                checked={on}
                                onChange={() => setPrefs((cur) => ({ ...cur, [p.key]: o.value }))}
                                className="peer sr-only"
                              />
                              {on && <motion.span layoutId={`pref-${p.key}`} className="absolute inset-0 z-0 rounded bg-elevated" />}
                              <span className="relative z-10 rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-cyan">{i18n.tx(o.label)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && chosenMode && chosenObjective && (
              <div>
                <h1 id="step-title-3" className="text-3xl font-semibold">{i18n.t("You’re ready,")}{" "}{i18n.tx(name.trim().split(" ")[0])}</h1>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Learning mode", value: chosenMode.title, edit: 1 },
                    { label: "Goal", value: chosenObjective.title, edit: 2 },
                    {
                      label: "Explanations start",
                      value: PREFERENCE_OPTIONS[0].options.find((o) => o.value === prefs.explanationStart)!.label,
                      edit: 2,
                    },
                    { label: "Hints", value: PREFERENCE_OPTIONS[1].options.find((o) => o.value === prefs.hints)!.label, edit: 2 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-3 rounded-md border border-line bg-surface p-4">
                      <div>
                        <p className="text-xs text-muted">{i18n.tx(row.label)}</p>
                        <p className="mt-0.5 font-medium">{i18n.tx(row.value)}</p>
                      </div>
                      <button type="button" onClick={() => go(row.edit)} className="text-sm text-accent hover:underline">{i18n.t("Change")}</button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-cyan/30 bg-cyan/[0.06] p-5">
                  <p className="text-sm font-medium text-cyan-ink">{i18n.t("Your first step")}</p>
                  <p className="mt-1">{i18n.tx(chosenMode.firstStep)}</p>
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      {attempted && stepError && (
        <p role="alert" className="mt-6 text-sm text-bad-ink">{i18n.tx(stepError)}</p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => go(step - 1)}>
            <ArrowLeft size={16} aria-hidden="true" />{" "}{i18n.t("Back")}</Button>
        ) : (
          <Link href="/" className="text-sm text-muted hover:text-text">{i18n.t("Back to home")}</Link>
        )}
        {step < 3 ? (
          <Button size="lg" onClick={next}>{i18n.t("Continue")}{" "}<ArrowRight size={16} aria-hidden="true" />
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="lg" onClick={() => finish("/dashboard")}>{i18n.t("Go to dashboard")}</Button>
            <Button size="lg" onClick={() => finish("/assessment/diagnostic")}>{i18n.t("Start Diagnostic")}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
