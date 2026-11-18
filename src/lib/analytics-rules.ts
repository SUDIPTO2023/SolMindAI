// Every analytics figure is computed here from the shared learning record.
// No number on the Analytics page or Dashboard is typed in by hand.

import { STATUS_META } from "@/lib/constants";
import type { MasterySnapshot } from "@/lib/graph-rules";
import { BloomLevelSchema, DifficultySchema, type GapEvidence, type QuestionAttempt } from "@/types/assessment";
import type { LearningEvent, MasteryRecord, Topic } from "@/types/learning";

// Questions that test the idea only, with no calculation.
const CONCEPT_ONLY = /^(R\d+|L\d+|PF|SC\d+)$/;

/**
 * Which layer an answer is evidence for. A correct problem counts for both
 * layers; a wrong one counts against the layer its diagnosis identified.
 */
export function layerResult(a: QuestionAttempt): { conceptual: boolean | null; mathematical: boolean | null } {
  if (CONCEPT_ONLY.test(a.questionId)) return { conceptual: a.correct, mathematical: null };
  if (a.correct) return { conceptual: true, mathematical: true };
  switch (a.gapType) {
    case "conceptual":
      return { conceptual: false, mathematical: true };
    case "mixed":
      return { conceptual: false, mathematical: null };
    case "mathematical":
      return { conceptual: true, mathematical: false };
    default:
      return { conceptual: null, mathematical: null };
  }
}

/** Mastery across the whole chapter, where a topic not yet assessed counts as 0. */
export const chapterMastery = (mastery: MasteryRecord[]) =>
  mastery.length ? Math.round(mastery.reduce((s, m) => s + (m.status === "not_assessed" ? 0 : m.score), 0) / mastery.length) : 0;

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : null);

export interface AnalyticsInput {
  attempts: QuestionAttempt[];
  mastery: MasteryRecord[];
  history: MasterySnapshot[];
  gaps: GapEvidence[];
  tutorHints: number;
  events: LearningEvent[];
  topics: Topic[];
}

const EVENT_LABEL: Record<LearningEvent["type"], string> = {
  onboarding: "Onboarding",
  mode: "Mode changes",
  assessment: "Assessment",
  gap: "Gap investigation",
  tutor: "Tutoring",
  practice: "Practice",
  mastery: "Mastery updates",
  system: "System",
};

export function computeAnalytics({ attempts, mastery, history, gaps, tutorHints, events, topics }: AnalyticsInput) {
  const correct = attempts.filter((a) => a.correct);
  const assessed = mastery.filter((m) => m.status !== "not_assessed");

  const layers = (["conceptual", "mathematical"] as const).map((layer) => {
    const results = attempts.map((a) => layerResult(a)[layer]).filter((r): r is boolean => r !== null);
    const ok = results.filter(Boolean).length;
    return { layer: layer === "conceptual" ? "Conceptual" : "Mathematical", correct: ok, total: results.length, pct: pct(ok, results.length) };
  });

  const difficulty = DifficultySchema.options.map((level) => {
    const list = attempts.filter((a) => a.difficulty === level);
    const ok = list.filter((a) => a.correct).length;
    return { level, correct: ok, incorrect: list.length - ok, total: list.length, pct: pct(ok, list.length) };
  });

  const bloom = BloomLevelSchema.options.map((level) => {
    const list = attempts.filter((a) => a.bloom === level);
    const ok = list.filter((a) => a.correct).length;
    return { level, correct: ok, total: list.length, pct: pct(ok, list.length), shown: pct(ok, list.length) ?? 0, label: list.length ? `${pct(ok, list.length)}%` : "No data" };
  });

  const independent = correct.filter((a) => a.hintsUsed === 0).length;
  const typeCounts = events.reduce<Record<string, number>>((acc, e) => ((acc[e.type] = (acc[e.type] ?? 0) + 1), acc), {});

  return {
    overview: {
      chapterMastery: chapterMastery(mastery),
      assessedAverage: assessed.length ? Math.round(assessed.reduce((s, m) => s + m.score, 0) / assessed.length) : null,
      developingOrBetter: mastery.filter((m) => m.status === "developing" || m.status === "mastered").length,
      totalTopics: mastery.length,
      answered: attempts.length,
      accuracy: pct(correct.length, attempts.length),
      independentRate: pct(independent, correct.length),
      gapsVerified: gaps.filter((g) => g.status === "verified" && g.gapType !== "none").length,
    },
    topicMastery: topics.map((t) => {
      const m = mastery.find((x) => x.topicId === t.id);
      const status = m?.status ?? "not_assessed";
      return {
        id: t.id,
        title: t.title,
        status,
        color: STATUS_META[status].color,
        score: status === "not_assessed" ? 0 : m?.score ?? 0,
        label: status === "not_assessed" ? "Not assessed" : `${m?.score}%`,
      };
    }),
    progress: history.map((h) => ({
      label: h.label,
      chapter: chapterMastery(h.mastery),
      netForce: (() => {
        const n = h.mastery.find((m) => m.topicId === "net-force");
        return n && n.status !== "not_assessed" ? n.score : null;
      })(),
    })),
    layers,
    difficulty,
    bloom,
    independence: {
      slices: [
        { name: "Solved independently", value: independent, color: "#16A34A" },
        { name: "Solved with hints", value: correct.length - independent, color: "#F59E0B" },
        { name: "Not yet correct", value: attempts.length - correct.length, color: "#EF4444" },
      ],
      tutorHints,
      answerHints: attempts.reduce((s, a) => s + a.hintsUsed, 0),
    },
    activity: {
      byType: Object.entries(typeCounts)
        .map(([type, count]) => ({ type, label: EVENT_LABEL[type as LearningEvent["type"]] ?? type, count }))
        .sort((a, b) => b.count - a.count),
      recent: events.slice(0, 8),
    },
  };
}

export type Analytics = ReturnType<typeof computeAnalytics>;
