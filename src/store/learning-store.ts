"use client";

// The single source of truth for the demo learner. Every page reads from
// and writes to this store, so dashboard, knowledge map and analytics can
// never show different numbers.
//
// Phase 2 holds the profile, preferences, mastery and activity. Later phases
// add assessment, evidence, tutoring and practice state to this same store.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BASELINE_MASTERY, DEMO_STUDENT } from "@/data/demo-scenarios";
import { DEFAULT_PREFERENCES, modeById } from "@/data/onboarding";
import { KNOWLEDGE_GRAPH, TOPICS } from "@/data/topics";
import { learningService } from "@/services/service-provider";
import { readinessLevel } from "@/lib/diagnosis-rules";
import type { MasterySnapshot } from "@/lib/graph-rules";
import type {
  ChoiceQuestion,
  DiagnosticEvaluation,
  FollowUpQuestion,
  ForceProblem,
  GapEvidence,
  QuestionAttempt,
  ReadinessLevel,
  StudentResponse,
} from "@/types/assessment";
import type {
  FoundationLesson,
  PracticeQuestion,
  PracticeResult,
  TutorChip,
  TutorMessage,
  TutorMessageDraft,
} from "@/types/tutoring";
import type { Unit } from "@/types/assessment";
import type {
  LearningEvent,
  LearningMode,
  LearningObjective,
  LearningPreferences,
  MasteryRecord,
  StudentProfile,
} from "@/types/learning";

export type AssessmentPhase = "readiness" | "question" | "evaluated" | "followup" | "complete";

export interface AssessmentSession {
  questionIndex: number;
  phase: AssessmentPhase;
  readinessAnswers: Record<string, string>; // question id -> option id
  readiness: ReadinessLevel | null;
  hintsUsed: number;
  response: StudentResponse | null;
  evaluation: DiagnosticEvaluation | null;
  followUp: FollowUpQuestion | null;
  result: GapEvidence | null;
  masteryBefore: MasteryRecord[] | null;
  pending: boolean;
  error: string | null;
}

export interface TutorSession {
  questionId: string | null;
  gapId: string | null; // the diagnostic finding this session was built for
  step: number;
  messages: TutorMessage[];
  chips: TutorChip[];
  hintLevel: number; // hints shown for the current step
  hintsUsed: number; // across the session
  typing: boolean;
  done: boolean;
  basicsDone: boolean;
  error: string | null;
}

export interface PracticeSession {
  current: PracticeQuestion | null;
  answered: boolean;
  feedback: { correct: boolean; text: string } | null;
  results: PracticeResult[];
  done: boolean;
  pending: boolean;
  error: string | null;
}

export interface LearningState {
  profile: StudentProfile;
  learningMode: LearningMode | null;
  objective: LearningObjective | null;
  preferences: LearningPreferences;
  onboardingComplete: boolean;
  selectedTopicId: string;
  mastery: MasteryRecord[];
  events: LearningEvent[];
  assessment: AssessmentSession;
  attempts: QuestionAttempt[];
  gapEvidence: GapEvidence[];
  tutor: TutorSession;
  practice: PracticeSession;
  masteryHistory: MasterySnapshot[]; // one snapshot per step that changed mastery
}

interface LearningActions {
  setLearningMode: (mode: LearningMode) => void;
  completeOnboarding: (input: {
    name: string;
    mode: LearningMode;
    objective: LearningObjective;
    preferences: LearningPreferences;
  }) => void;
  selectTopic: (topicId: string) => void;
  updateTopicMastery: (record: MasteryRecord, reason: string) => void;
  logEvent: (event: Omit<LearningEvent, "id" | "at">) => void;
  resetDemo: () => void;
  // Phase 3: diagnostic assessment
  startAssessment: (options?: { nextQuestion?: boolean; questionCount?: number }) => void;
  answerReadiness: (question: ChoiceQuestion, optionId: string) => void;
  finishReadiness: (questions: ChoiceQuestion[]) => void;
  recordHintUsage: () => void;
  submitAnswer: (problem: ForceProblem, response: StudentResponse) => Promise<void>;
  startFollowUp: () => void;
  submitFollowUp: (problem: ForceProblem, optionId: string) => Promise<void>;
  // Phase 4: tutoring and adaptive practice
  initTutorSession: (options?: { restart?: boolean }) => Promise<void>;
  sendTutorMessage: (text: string, chipKind?: TutorChip["kind"]) => Promise<void>;
  requestTutorHint: () => Promise<void>;
  completeBasics: (lesson: FoundationLesson, correct: boolean) => void;
  startPractice: () => Promise<void>;
  submitPracticeAnswer: (given: string, unit: Unit) => Promise<void>;
  nextPractice: () => Promise<void>;
  // Phase 5: knowledge map
  snapshotMastery: (label: string) => void;
}

interface HydrationState {
  hasHydrated: boolean;
}

let eventCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${eventCounter++}`;

export const freshAssessment = (questionIndex = 0, keepReadiness?: Pick<AssessmentSession, "readiness" | "readinessAnswers">): AssessmentSession => ({
  questionIndex,
  phase: keepReadiness?.readiness ? "question" : "readiness",
  readinessAnswers: keepReadiness?.readinessAnswers ?? {},
  readiness: keepReadiness?.readiness ?? null,
  hintsUsed: 0,
  response: null,
  evaluation: null,
  followUp: null,
  result: null,
  masteryBefore: null,
  pending: false,
  error: null,
});

export const freshTutor = (basicsDone = false): TutorSession => ({
  questionId: null,
  gapId: null,
  step: 0,
  messages: [],
  chips: [],
  hintLevel: 0,
  hintsUsed: 0,
  typing: false,
  done: false,
  basicsDone,
  error: null,
});

export const freshPractice = (): PracticeSession => ({
  current: null,
  answered: false,
  feedback: null,
  results: [],
  done: false,
  pending: false,
  error: null,
});

const withIds = (drafts: TutorMessageDraft[]): TutorMessage[] => drafts.map((d) => ({ ...d, id: uid("msg") }));

const READINESS_LABEL: Record<ReadinessLevel, string> = {
  ready: "Ready",
  partially_ready: "Partially ready",
  foundation_needed: "Foundation needed",
};
const GAP_LABEL: Record<string, string> = {
  conceptual: "conceptual gap",
  mathematical: "mathematical gap",
  mixed: "mixed gap",
  none: "no gap",
  insufficient_evidence: "insufficient evidence",
};
const newEvent = (e: Omit<LearningEvent, "id" | "at">): LearningEvent => ({
  ...e,
  id: `evt-${Date.now().toString(36)}-${eventCounter++}`,
  at: new Date().toISOString(),
});

const TOPIC_TITLE: Record<string, string> = Object.fromEntries(TOPICS.map((t) => [t.id, t.title]));
const STATUS_TEXT = { mastered: "Mastered", developing: "Developing", weak: "Weak", not_assessed: "Not assessed" } as const;

export const initialLearningState = (): LearningState => ({
  profile: { ...DEMO_STUDENT },
  learningMode: null,
  objective: null,
  preferences: { ...DEFAULT_PREFERENCES },
  onboardingComplete: false,
  selectedTopicId: KNOWLEDGE_GRAPH.targetTopicId,
  mastery: BASELINE_MASTERY.map((m) => ({ ...m })),
  events: [
    newEvent({ type: "system", message: "Sample learner profile loaded", tone: "info" }),
  ],
  assessment: freshAssessment(),
  attempts: [],
  gapEvidence: [],
  tutor: freshTutor(),
  practice: freshPractice(),
  masteryHistory: [
    { id: "snap-start", label: "Start", at: new Date().toISOString(), mastery: BASELINE_MASTERY.map((m) => ({ ...m })) },
  ],
});

export const useLearningStore = create<LearningState & LearningActions & HydrationState>()(
  persist(
    (set, get) => ({
      ...initialLearningState(),
      hasHydrated: false,

      setLearningMode: (mode) => {
        if (get().learningMode === mode) return;
        set({ learningMode: mode });
      },

      completeOnboarding: ({ name, mode, objective, preferences }) => {
        const title = modeById(mode)?.title ?? mode;
        set((s) => ({
          profile: { ...s.profile, name: name.trim() },
          learningMode: mode,
          objective,
          preferences,
          onboardingComplete: true,
          events: [
            newEvent({ type: "mode", message: `Learning mode set to ${title}`, tone: "info" }),
            newEvent({ type: "onboarding", message: "Onboarding completed", tone: "success" }),
            ...s.events,
          ].slice(0, 50),
        }));
      },

      selectTopic: (topicId) => set({ selectedTopicId: topicId }),

      updateTopicMastery: (record, reason) =>
        set((s) => ({
          mastery: s.mastery.map((m) => (m.topicId === record.topicId ? record : m)),
          events: [newEvent({ type: "mastery", message: reason, tone: "info" }), ...s.events].slice(0, 50),
        })),

      logEvent: (event) => set((s) => ({ events: [newEvent(event), ...s.events].slice(0, 50) })),

      resetDemo: () => set({ ...initialLearningState(), hasHydrated: true }),

      startAssessment: (options) => {
        const a = get().assessment;
        if (options?.nextQuestion) {
          const count = options.questionCount ?? 1;
          set({ assessment: freshAssessment((a.questionIndex + 1) % count, a) });
        } else {
          set({ assessment: freshAssessment() });
        }
      },

      answerReadiness: (question, optionId) => {
        const a = get().assessment;
        if (a.readinessAnswers[question.id]) return; // first answer counts
        const correct = !!question.options.find((o) => o.id === optionId)?.correct;
        set((s) => ({
          assessment: { ...a, readinessAnswers: { ...a.readinessAnswers, [question.id]: optionId } },
          attempts: [
            ...s.attempts,
            {
              id: uid("att"), questionId: question.id, topicId: question.topicId, label: `Readiness check ${question.id}`,
              correct, difficulty: question.difficulty, bloom: question.bloom, gapType: null, hintsUsed: 0,
              at: new Date().toISOString(), isSample: false,
            },
          ],
        }));
      },

      finishReadiness: (questions) => {
        const a = get().assessment;
        const correct = questions.filter((q) => q.options.find((o) => o.id === a.readinessAnswers[q.id])?.correct).length;
        const level = readinessLevel(correct, questions.length);
        set({ assessment: { ...a, readiness: level, phase: "question" } });
        get().logEvent({
          type: "assessment",
          message: `Readiness for Newton’s Second Law: ${READINESS_LABEL[level]}`,
          tone: level === "ready" ? "success" : "warning",
        });
      },

      recordHintUsage: () => {
        const a = get().assessment;
        if (a.hintsUsed >= 3) return;
        set({ assessment: { ...a, hintsUsed: a.hintsUsed + 1 } });
      },

      submitAnswer: async (problem, response) => {
        const start = get().assessment;
        set({ assessment: { ...start, pending: true, error: null, response } });
        try {
          const evaluation = await learningService.evaluateDiagnostic(problem.id, response);
          const followUp = await learningService.getFollowUp(problem.id, evaluation);
          const a = get().assessment;
          const attempt: QuestionAttempt = {
            id: uid("att"), questionId: problem.id, topicId: problem.topicId,
            label: `Diagnostic ${problem.id}`, correct: evaluation.isCorrect, difficulty: problem.difficulty,
            bloom: problem.bloom, gapType: evaluation.gapType, hintsUsed: a.hintsUsed,
            at: new Date().toISOString(), isSample: false,
          };
          set((s) => ({
            assessment: { ...a, evaluation, followUp, masteryBefore: s.mastery, pending: false, phase: followUp ? "evaluated" : a.phase },
            attempts: [...s.attempts, attempt],
          }));
          get().logEvent({
            type: "assessment",
            message: `Diagnostic answer checked: ${response.value} ${response.unit}`,
            tone: evaluation.isCorrect ? "success" : "warning",
          });
          if (followUp) {
            get().logEvent({
              type: "gap",
              message: evaluation.status === "suspected" ? `Suspected ${GAP_LABEL[evaluation.gapType]}, follow-up needed` : "Cause unclear, follow-up needed",
              tone: "warning",
            });
          } else {
            await get().submitFollowUp(problem, "");
          }
        } catch {
          set({ assessment: { ...get().assessment, pending: false, error: "The answer could not be checked. Try again." } });
        }
      },

      initTutorSession: async (options) => {
        const s = get();
        if (s.tutor.questionId && !options?.restart) return;
        const gap = s.gapEvidence.at(-1) ?? null;
        const questionId = gap?.questionId ?? "Q001";
        set({ tutor: { ...freshTutor(s.tutor.basicsDone), questionId, gapId: gap?.id ?? null, typing: true } });
        try {
          const [opening, chips] = await Promise.all([
            learningService.startTutorSession(questionId, gap, s.preferences),
            learningService.getTutorChips(questionId, 0),
          ]);
          set({ tutor: { ...get().tutor, messages: withIds(opening), chips, typing: false } });
          if (options?.restart) get().logEvent({ type: "tutor", message: "Guided session restarted", tone: "info" });
        } catch {
          set({ tutor: { ...get().tutor, typing: false, error: "The tutor could not start. Try again." } });
        }
      },

      sendTutorMessage: async (text, chipKind) => {
        const t = get().tutor;
        if (!t.questionId || t.typing || t.done || !text.trim()) return;
        const student: TutorMessage = { id: uid("msg"), role: "student", text: text.trim() };
        set({ tutor: { ...t, messages: [...t.messages, student], typing: true, error: null } });
        try {
          const turn = await learningService.getTutorResponse({
            questionId: t.questionId, step: t.step, text, chipKind, hintLevel: t.hintLevel, prefs: get().preferences,
          });
          const step = turn.advance ? t.step + 1 : t.step;
          const chips = turn.done ? [] : turn.advance ? await learningService.getTutorChips(t.questionId, step) : get().tutor.chips;
          const cur = get().tutor;
          set({
            tutor: {
              ...cur,
              messages: [...cur.messages, ...withIds(turn.messages)],
              step,
              chips,
              hintLevel: turn.advance ? 0 : cur.hintLevel + (turn.hintUsed ? 1 : 0),
              hintsUsed: cur.hintsUsed + (turn.hintUsed ? 1 : 0),
              typing: false,
              done: turn.done,
            },
          });
          if (turn.done) get().logEvent({ type: "tutor", message: "Guided Socratic session completed", tone: "success" });
        } catch {
          set({ tutor: { ...get().tutor, typing: false, error: "The tutor didn’t respond. Send your reply again." } });
        }
      },

      requestTutorHint: async () => {
        const t = get().tutor;
        if (!t.questionId || t.typing || t.done || t.hintLevel >= 3) return;
        set({ tutor: { ...t, typing: true } });
        try {
          const hint = await learningService.getTutorHint(t.questionId, t.step, t.hintLevel + 1);
          const cur = get().tutor;
          set({
            tutor: {
              ...cur,
              typing: false,
              messages: hint ? [...cur.messages, ...withIds([hint])] : cur.messages,
              hintLevel: cur.hintLevel + 1,
              hintsUsed: cur.hintsUsed + 1,
            },
          });
        } catch {
          set({ tutor: { ...get().tutor, typing: false, error: "The hint could not load. Try again." } });
        }
      },

      completeBasics: (lesson, correct) => {
        if (get().tutor.basicsDone) return;
        set((s) => ({
          tutor: { ...s.tutor, basicsDone: true },
          attempts: [
            ...s.attempts,
            {
              id: uid("att"), questionId: lesson.check.id, topicId: lesson.topicId, label: "Foundation lesson check",
              correct, difficulty: lesson.check.difficulty, bloom: lesson.check.bloom, gapType: null, hintsUsed: 0,
              at: new Date().toISOString(), isSample: false,
            },
          ],
        }));
        get().logEvent({ type: "tutor", message: "Foundation lesson on Net Force completed", tone: correct ? "success" : "info" });
      },

      startPractice: async () => {
        const p = get().practice;
        if (p.pending || p.current) return;
        set({ practice: { ...freshPractice(), pending: true } });
        try {
          const current = await learningService.getAdaptiveQuestion(null);
          set({ practice: { ...get().practice, current, pending: false } });
        } catch {
          set({ practice: { ...get().practice, pending: false, error: "The practice question could not load. Try again." } });
        }
      },

      submitPracticeAnswer: async (given, unit) => {
        const p = get().practice;
        if (!p.current || p.answered || p.pending) return;
        const q = p.current;
        set({ practice: { ...p, pending: true, error: null } });
        try {
          const outcome = await learningService.submitPracticeAttempt(q.id, given, unit);
          const result: PracticeResult = { id: q.id, given, unit, correct: outcome.correct, unitOk: outcome.unitOk, at: new Date().toISOString() };
          set((s) => ({
            practice: { ...s.practice, answered: true, pending: false, feedback: { correct: outcome.correct, text: outcome.feedback }, results: [...s.practice.results, result] },
            attempts: [
              ...s.attempts,
              {
                id: uid("att"), questionId: q.id, topicId: q.topicId, label: `Practice ${q.id}`, correct: outcome.correct,
                difficulty: q.difficulty, bloom: q.bloom, gapType: null, hintsUsed: 0, at: result.at, isSample: false,
              },
            ],
          }));
          get().logEvent({
            type: "practice",
            message: `${q.difficulty} practice question ${outcome.correct ? "solved" : "missed"}`,
            tone: outcome.correct ? "success" : "warning",
          });
          let practiceChanged = false;
          for (const u of outcome.masteryUpdates) {
            const current = get().mastery.find((m) => m.topicId === u.topicId);
            if (!current) continue;
            // Never lower a score or undo Mastered from a practice answer.
            const next: MasteryRecord = current.status === "mastered"
              ? current
              : { topicId: u.topicId, status: u.status, score: Math.max(current.score, u.score) };
            if (next.status === current.status && next.score === current.score) continue;
            practiceChanged = true;
            get().updateTopicMastery(next, `${TOPIC_TITLE[u.topicId] ?? u.topicId} is now ${STATUS_TEXT[next.status]}`);
          }
          if (practiceChanged) get().snapshotMastery(`${q.difficulty} practice solved`);
        } catch {
          set({ practice: { ...get().practice, pending: false, error: "The answer could not be checked. Try again." } });
        }
      },

      nextPractice: async () => {
        const p = get().practice;
        const last = p.results.at(-1);
        if (!p.current || !last || p.pending) return;
        set({ practice: { ...p, pending: true } });
        try {
          const next = await learningService.getAdaptiveQuestion({ id: last.id, correct: last.correct });
          set({
            practice: { ...get().practice, current: next, answered: false, feedback: null, pending: false, done: next === null },
          });
          if (next === null) get().logEvent({ type: "practice", message: "Adaptive practice completed", tone: "success" });
        } catch {
          set({ practice: { ...get().practice, pending: false, error: "The next question could not load. Try again." } });
        }
      },

      snapshotMastery: (label) =>
        set((s) => ({
          masteryHistory: [
            ...s.masteryHistory,
            { id: uid("snap"), label, at: new Date().toISOString(), mastery: s.mastery.map((m) => ({ ...m })) },
          ].slice(-20),
        })),

      startFollowUp: () => set({ assessment: { ...get().assessment, phase: "followup" } }),

      submitFollowUp: async (problem, optionId) => {
        const a = get().assessment;
        if (!a.evaluation) return;
        set({ assessment: { ...a, pending: true, error: null } });
        try {
          const { finding, masteryUpdates } = await learningService.resolveDiagnostic(
            problem.id, a.evaluation, a.followUp, optionId || null,
          );
          const result: GapEvidence = { ...finding, id: uid("gap"), at: new Date().toISOString() };
          set((s) => ({
            assessment: { ...get().assessment, result, pending: false, phase: "complete" },
            gapEvidence: [...s.gapEvidence, result],
            attempts: s.attempts.map((t) =>
              t.questionId === problem.id && t === s.attempts.filter((x) => x.questionId === problem.id).at(-1)
                ? { ...t, gapType: result.gapType }
                : t,
            ),
            selectedTopicId: result.recommendedTopicId ?? s.selectedTopicId,
          }));
          if (optionId) {
            get().logEvent({
              type: "gap",
              message: result.status === "verified" ? `Gap verified: ${GAP_LABEL[result.gapType]}` : `Follow-up answered: ${GAP_LABEL[result.gapType]}`,
              tone: result.status === "verified" ? "error" : "info",
            });
          }
          // Apply mastery changes one by one so each is explained in the activity log.
          let changed = false;
          for (const u of masteryUpdates) {
            const current = get().mastery.find((m) => m.topicId === u.topicId);
            const next = result.gapType === "none" && current ? { ...u, score: Math.max(current.score, u.score) } : u;
            if (current && current.status === next.status && current.score === next.score) continue;
            changed = true;
            get().updateTopicMastery(next, `${TOPIC_TITLE[u.topicId] ?? u.topicId} is now ${STATUS_TEXT[next.status]}`);
          }
          if (changed) get().snapshotMastery(result.gapType === "none" ? "Diagnostic correct" : "Gap verified");
        } catch {
          set({ assessment: { ...get().assessment, pending: false, error: "The result could not be worked out. Try again." } });
        }
      },
    }),
    {
      name: "solmind-learning-state",
      version: 4,
      // Older saved demo data does not have the assessment fields: start fresh.
      migrate: () => initialLearningState(),
      storage: createJSONStorage(() => localStorage),
      // Read saved state only after the first client render, to avoid hydration mismatches.
      skipHydration: true,
      // Only data is saved; actions and the hydration flag are not.
      partialize: (s): LearningState => ({
        profile: s.profile,
        learningMode: s.learningMode,
        objective: s.objective,
        preferences: s.preferences,
        onboardingComplete: s.onboardingComplete,
        selectedTopicId: s.selectedTopicId,
        mastery: s.mastery,
        events: s.events,
        assessment: { ...s.assessment, pending: false, error: null },
        attempts: s.attempts,
        gapEvidence: s.gapEvidence,
        tutor: { ...s.tutor, typing: false, error: null },
        practice: { ...s.practice, pending: false, error: null },
        masteryHistory: s.masteryHistory,
      }),
      onRehydrateStorage: () => () => useLearningStore.setState({ hasHydrated: true }),
    },
  ),
);

/** Loads saved demo state once, on the client. Safe to call from several layouts. */
export function rehydrateLearningStore() {
  if (!useLearningStore.getState().hasHydrated) void useLearningStore.persist.rehydrate();
}
