// Deterministic rules for the diagnostic session: hints, readiness, the
// follow-up question, and what a confirmed finding changes in mastery.
// A suspected gap never changes mastery. Only verified evidence does.

import type {
  DiagnosticEvaluation,
  FollowUpQuestion,
  ForceProblem,
  GapEvidence,
  Hint,
  ReadinessLevel,
  StudentResponse,
} from "@/types/assessment";
import type { MasteryRecord, TopicStatus } from "@/types/learning";

export type Finding = Omit<GapEvidence, "id" | "at">;

export interface Resolution {
  finding: Finding;
  masteryUpdates: MasteryRecord[];
}

const net = (p: ForceProblem) => p.appliedForce - p.frictionForce;

export function hintsFor(p: ForceProblem): Hint[] {
  return [
    { level: 1, kind: "concept", text: "Before any formula, list every horizontal force on the object and the direction each one points." },
    { level: 2, kind: "formula", text: "Newton’s second law uses the net force: a = F(net) ÷ m. Forces in opposite directions are subtracted." },
    { level: 3, kind: "step", text: `First find F(net) = ${p.appliedForce} − ${p.frictionForce}. Then divide that by ${p.mass} kg.` },
  ];
}

export function readinessLevel(correct: number, total: number): ReadinessLevel {
  if (correct === total) return "ready";
  return correct > 0 ? "partially_ready" : "foundation_needed";
}

/** A common wrong answer: the applied force divided by the mass. Used by the demo helper. */
export function commonMistake(p: ForceProblem): StudentResponse {
  const v = Math.round((p.appliedForce / p.mass) * 100) / 100;
  return { value: String(v), unit: p.unit, working: `a = F / m\na = ${p.appliedForce} / ${p.mass} = ${v}` };
}

export function needsFollowUp(e: DiagnosticEvaluation) {
  return e.status === "suspected" || e.status === "uncertain";
}

export function followUpFor(p: ForceProblem, e: DiagnosticEvaluation): FollowUpQuestion {
  if (e.possibleMisconceptionId === "M06") {
    return {
      id: "friction_direction",
      prompt: `Which way does the ${p.frictionForce} N of friction act on the moving object?`,
      options: [
        { id: "forward", label: "Forward, the same way as the push" },
        { id: "backward_added", label: "Backward, against the push. I added it anyway" },
        { id: "not_sure", label: "I’m not sure" },
      ],
    };
  }
  if (e.possibleMisconceptionId === "M07") {
    return {
      id: "which_force",
      prompt: "In a = F ÷ m, which force should F be?",
      options: [
        { id: "push", label: `The ${p.appliedForce} N push` },
        { id: "net", label: `The ${net(p)} N net force. I divided the wrong number` },
        { id: "not_sure", label: "I’m not sure" },
      ],
    };
  }
  return {
    id: "forces",
    prompt: "Which horizontal forces act on the object, and how did you use them?",
    options: [
      { id: "only_push", label: `Only the ${p.appliedForce} N push` },
      { id: "not_subtracted", label: `The ${p.appliedForce} N push and ${p.frictionForce} N friction, but I didn’t subtract friction` },
      { id: "net_slip", label: `I found the ${net(p)} N net force, then made a calculation mistake` },
      { id: "not_sure", label: "I’m not sure" },
    ],
  };
}

const MASTERY_EFFECTS: Record<string, [string, TopicStatus, number][]> = {
  M05: [["net-force", "weak", 32], ["second-law", "weak", 36]],
  M06: [["friction", "weak", 30], ["net-force", "weak", 38], ["second-law", "weak", 38]],
  M07: [["second-law", "weak", 40], ["net-force", "developing", 55]],
  M08: [["net-force", "weak", 42], ["friction", "developing", 55], ["second-law", "weak", 40]],
  mathematical: [["net-force", "developing", 62], ["friction", "developing", 60], ["second-law", "developing", 55]],
  none: [["net-force", "developing", 66], ["friction", "developing", 64], ["second-law", "developing", 64]],
};

/**
 * What a finding changes. Correct answers move topics to Developing at most:
 * one correct answer is never enough for Mastered.
 */
export function masteryUpdatesFor(f: Finding): MasteryRecord[] {
  let key: string | null = null;
  if (f.gapType === "none") key = "none";
  else if (f.status !== "verified") key = null;
  else if (f.gapType === "mathematical") key = "mathematical";
  else key = f.misconceptionId;
  return (key ? MASTERY_EFFECTS[key] ?? [] : []).map(([topicId, status, score]) => ({ topicId, status, score }));
}

const base = (e: DiagnosticEvaluation, followUpAnswer: string | null): Pick<Finding, "questionId" | "followUpAnswer"> => ({
  questionId: e.questionId,
  followUpAnswer,
});

/** For results that need no follow-up: correct answers and objectively verified slips. */
export function resolveDirect(e: DiagnosticEvaluation): Resolution {
  const finding: Finding = {
    ...base(e, null),
    gapType: e.gapType,
    status: e.status,
    confidence: e.confidence,
    evidence: e.evidence,
    misconceptionId: e.possibleMisconceptionId,
    recommendedTopicId: e.recommendedTopicId,
    nextAction: e.nextAction,
  };
  return { finding, masteryUpdates: masteryUpdatesFor(finding) };
}

export function resolveFollowUp(
  p: ForceProblem,
  e: DiagnosticEvaluation,
  followUp: FollowUpQuestion,
  optionId: string,
): Resolution {
  const label = followUp.options.find((o) => o.id === optionId)?.label ?? optionId;
  const said = `Follow-up: “${label}”.`;
  const ev = [...e.evidence, said];
  const workingContradicts = e.checks.find((c) => c.id === "net_force")?.passed === false;
  const unsure: Finding = {
    ...base(e, label),
    gapType: "insufficient_evidence",
    status: "uncertain",
    confidence: "low",
    evidence: ev,
    misconceptionId: null,
    recommendedTopicId: "net-force",
    nextAction: "Start from the foundation of net force with the tutor. Nothing is marked against you.",
  };

  let finding: Finding = unsure;
  if (followUp.id === "forces") {
    if (optionId === "only_push")
      finding = {
        ...base(e, label), gapType: "conceptual", status: "verified", confidence: e.confidence === "low" ? "medium" : "high",
        evidence: ev, misconceptionId: "M05", recommendedTopicId: "net-force",
        nextAction: "Rebuild net force: name every force, then combine them before using a = F ÷ m.",
      };
    else if (optionId === "not_subtracted")
      finding = {
        ...base(e, label), gapType: "mixed", status: "verified", confidence: "medium",
        evidence: ev, misconceptionId: "M08", recommendedTopicId: "net-force",
        nextAction: "Practise combining opposite forces into one net force, then apply a = F ÷ m.",
      };
    else if (optionId === "net_slip")
      finding = workingContradicts
        ? {
            ...unsure,
            evidence: [...ev, "The working divides the push, not the net force, so the two do not agree."],
            nextAction: "Solve it again and write every step, so the cause can be seen.",
          }
        : {
            ...base(e, label), gapType: "mathematical", status: "suspected", confidence: "medium",
            evidence: [...ev, "No working was given, so the slip cannot be confirmed yet."], misconceptionId: null,
            recommendedTopicId: null, nextAction: "Solve a new question showing each step, so the slip can be confirmed.",
          };
  } else if (followUp.id === "friction_direction") {
    if (optionId === "forward")
      finding = {
        ...base(e, label), gapType: "conceptual", status: "verified", confidence: "high",
        evidence: ev, misconceptionId: "M06", recommendedTopicId: "friction",
        nextAction: "Learn which way friction acts, then work out the net force again.",
      };
    else if (optionId === "backward_added")
      finding = {
        ...base(e, label), gapType: "mixed", status: "verified", confidence: "medium",
        evidence: ev, misconceptionId: "M08", recommendedTopicId: "net-force",
        nextAction: "Practise subtracting an opposing force before applying a = F ÷ m.",
      };
  } else if (followUp.id === "which_force") {
    if (optionId === "push")
      finding = {
        ...base(e, label), gapType: "conceptual", status: "verified", confidence: "high",
        evidence: ev, misconceptionId: "M07", recommendedTopicId: "second-law",
        nextAction: "Learn why Newton’s second law always uses the net force.",
      };
    else if (optionId === "net")
      finding = {
        ...base(e, label), gapType: "mathematical", status: "verified", confidence: "medium",
        evidence: ev, misconceptionId: null, recommendedTopicId: null,
        nextAction: "Practise the same method with new numbers, checking which value goes into each step.",
      };
  }
  return { finding, masteryUpdates: masteryUpdatesFor(finding) };
}

/**
 * The worked solution, step by step. Each step is linked to the check that
 * shows whether the student's own working got it right: naming and combining
 * the forces both depend on the net-force check, the last step on the final answer.
 */
export function solutionSteps(p: ForceProblem) {
  return [
    {
      title: "Name the forces",
      tex: String.raw`F_{\text{applied}} = ${p.appliedForce}\ \text{N}\ \rightarrow,\quad f = ${p.frictionForce}\ \text{N}\ \leftarrow`,
      checkId: "net_force" as const,
    },
    {
      title: "Combine them into the net force",
      tex: String.raw`F_{\text{net}} = ${p.appliedForce} - ${p.frictionForce} = ${net(p)}\ \text{N}`,
      checkId: "net_force" as const,
    },
    {
      title: "Apply Newton’s second law",
      tex: String.raw`a = \dfrac{F_{\text{net}}}{m} = \dfrac{${net(p)}}{${p.mass}} = ${p.answer}\ \text{m/s}^2`,
      checkId: "final_value" as const,
    },
  ];
}
