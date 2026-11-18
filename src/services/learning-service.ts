// The contract between the UI and whatever produces learning data.
// Today a mock implements it in the browser. After the demo, an API-backed
// implementation (Next.js route handlers, Supabase, AI services) replaces
// the mock without any change to the UI.

import type {
  ChoiceQuestion,
  DiagnosticEvaluation,
  FollowUpQuestion,
  ForceProblem,
  Hint,
  Misconception,
  StudentResponse,
} from "@/types/assessment";
import type { Resolution } from "@/lib/diagnosis-rules";
import type {
  CurriculumNote,
  FoundationLesson,
  PracticeId,
  PracticeQuestion,
  TutorChip,
  TutorMessageDraft,
  TutorTurn,
} from "@/types/tutoring";
import type { GapEvidence, QuestionAttempt, Unit } from "@/types/assessment";
import type { LearningPreferences, PrerequisiteEdge } from "@/types/learning";
import type { KnowledgeGraph, MasteryRecord, StudentProfile, Topic } from "@/types/learning";

export interface LearningService {
  getStudentProfile(): Promise<StudentProfile>;
  getTopics(): Promise<Topic[]>;
  getTopicDetails(topicId: string): Promise<Topic | null>;
  getKnowledgeGraph(): Promise<KnowledgeGraph>;
  getMastery(): Promise<MasteryRecord[]>;
  getDiagnosticQuestion(): Promise<ForceProblem>;
  evaluateDiagnostic(questionId: string, response: StudentResponse): Promise<DiagnosticEvaluation>;

  // Phase 3: diagnostic session
  getDiagnosticContent(): Promise<DiagnosticContent>;
  getHints(questionId: string): Promise<Hint[]>;
  getFollowUp(questionId: string, evaluation: DiagnosticEvaluation): Promise<FollowUpQuestion | null>;
  resolveDiagnostic(
    questionId: string,
    evaluation: DiagnosticEvaluation,
    followUp: FollowUpQuestion | null,
    optionId: string | null,
  ): Promise<Resolution>;

  // Phase 4: tutoring and adaptive practice
  getTutorContent(): Promise<TutorContent>;
  startTutorSession(questionId: string, gap: GapEvidence | null, prefs: LearningPreferences): Promise<TutorMessageDraft[]>;
  getTutorResponse(input: {
    questionId: string;
    step: number;
    text: string;
    chipKind?: TutorChip["kind"];
    hintLevel: number;
    prefs: LearningPreferences;
  }): Promise<TutorTurn>;
  getTutorHint(questionId: string, step: number, level: number): Promise<TutorMessageDraft | null>;
  getTutorChips(questionId: string, step: number): Promise<TutorChip[]>;
  getAdaptiveQuestion(last: { id: PracticeId; correct: boolean } | null): Promise<PracticeQuestion | null>;
  submitPracticeAttempt(id: PracticeId, given: string, unit: Unit): Promise<PracticeOutcome>;

  // Phase 6: analytics. The figures themselves are computed from the shared
  // learning record by lib/analytics-rules.ts; a backend can return the same shape.
  getSampleHistory(): Promise<QuestionAttempt[]>;
}

export interface DiagnosticContent {
  questions: ForceProblem[];
  readiness: ChoiceQuestion[];
  misconceptions: Misconception[];
  topics: Topic[];
}

export interface TutorContent {
  questions: ForceProblem[];
  lesson: FoundationLesson;
  notes: CurriculumNote[];
  topics: Topic[];
  edges: PrerequisiteEdge[];
  misconceptions: Misconception[];
}

export interface PracticeOutcome {
  correct: boolean;
  valueOk: boolean;
  unitOk: boolean;
  feedback: string;
  masteryUpdates: MasteryRecord[];
}
