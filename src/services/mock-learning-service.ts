import { DIAGNOSTIC_QUESTIONS, MAIN_DIAGNOSTIC, READINESS_QUESTIONS } from "@/data/questions";
import { MISCONCEPTIONS } from "@/data/misconceptions";
import { CURRICULUM_NOTES, NET_FORCE_LESSON } from "@/data/curriculum";
import { PRACTICE_QUESTIONS } from "@/data/practice";
import { hintMessage, openingMessages, respond as tutorRespond, socraticSteps } from "@/lib/tutor-rules";
import { FIRST_PRACTICE, checkPractice, nextPracticeId, practiceMasteryUpdates } from "@/lib/practice-rules";
import { CurriculumNoteSchema, FoundationLessonSchema, PracticeQuestionSchema } from "@/types/tutoring";
import { BASELINE_MASTERY, DEMO_STUDENT, SAMPLE_ATTEMPTS } from "@/data/demo-scenarios";
import { KNOWLEDGE_GRAPH } from "@/data/topics";
import { evaluateForceProblem } from "@/lib/physics-rules";
import { followUpFor, hintsFor, needsFollowUp, resolveDirect, resolveFollowUp } from "@/lib/diagnosis-rules";
import {
  ChoiceQuestionSchema,
  DiagnosticEvaluationSchema,
  QuestionAttemptSchema,
  MisconceptionSchema,
  ForceProblemSchema,
  StudentResponseSchema,
} from "@/types/assessment";
import { KnowledgeGraphSchema, MasteryRecordSchema } from "@/types/learning";
import type { LearningService } from "./learning-service";

// Demo data is validated once, so a typo in a data file fails loudly in development.
const graph = KnowledgeGraphSchema.parse(KNOWLEDGE_GRAPH);
const question = ForceProblemSchema.parse(MAIN_DIAGNOSTIC);
const questions = ForceProblemSchema.array().parse(DIAGNOSTIC_QUESTIONS);
const readiness = ChoiceQuestionSchema.array().parse(READINESS_QUESTIONS);
const misconceptions = MisconceptionSchema.array().parse(MISCONCEPTIONS);

const sampleHistory = QuestionAttemptSchema.array().parse(SAMPLE_ATTEMPTS);
const lesson = FoundationLessonSchema.parse(NET_FORCE_LESSON);
const notes = CurriculumNoteSchema.array().parse(CURRICULUM_NOTES);
const practice = PracticeQuestionSchema.array().parse(PRACTICE_QUESTIONS);
const findPractice = (id: string) => {
  const q = practice.find((x) => x.id === id);
  if (!q) throw new Error(`Unknown practice question ${id}`);
  return q;
};

const findQuestion = (id: string) => {
  const q = questions.find((x) => x.id === id);
  if (!q) throw new Error(`Unknown question ${id}`);
  return q;
};
const mastery = MasteryRecordSchema.array().parse(BASELINE_MASTERY);

/** A short pause so loading states are visible, like a real network call. */
const respond = <T,>(value: T, ms = 450) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

export const mockLearningService: LearningService = {
  getStudentProfile: () => respond(DEMO_STUDENT, 0),
  getTopics: () => respond(graph.topics, 0),
  getTopicDetails: (id) => respond(graph.topics.find((t) => t.id === id) ?? null, 0),
  getKnowledgeGraph: () => respond(graph, 0),
  getMastery: () => respond(mastery, 0),
  getDiagnosticQuestion: () => respond(question, 0),

  async evaluateDiagnostic(questionId, response) {
    const parsed = StudentResponseSchema.parse(response);
    const result = DiagnosticEvaluationSchema.parse(evaluateForceProblem(findQuestion(questionId), parsed));
    return respond(result, 900);
  },

  getDiagnosticContent: () => respond({ questions, readiness, misconceptions, topics: graph.topics }, 250),
  getHints: async (questionId) => respond(hintsFor(findQuestion(questionId)), 0),

  async getFollowUp(questionId, evaluation) {
    return respond(needsFollowUp(evaluation) ? followUpFor(findQuestion(questionId), evaluation) : null, 0);
  },

  async resolveDiagnostic(questionId, evaluation, followUp, optionId) {
    const q = findQuestion(questionId);
    const result = followUp && optionId ? resolveFollowUp(q, evaluation, followUp, optionId) : resolveDirect(evaluation);
    return respond(result, 700);
  },

  getTutorContent: () =>
    respond({ questions, lesson, notes, topics: graph.topics, edges: graph.edges, misconceptions }, 250),

  startTutorSession: async (questionId, gap, prefs) => respond(openingMessages(findQuestion(questionId), gap, prefs), 300),

  getTutorResponse: async ({ questionId, ...rest }) =>
    respond(tutorRespond({ problem: findQuestion(questionId), ...rest }), 750),

  getTutorHint: async (questionId, step, level) => respond(hintMessage(findQuestion(questionId), step, level), 400),

  getTutorChips: async (questionId, step) => respond(socraticSteps(findQuestion(questionId))[step]?.chips ?? [], 0),

  async getAdaptiveQuestion(last) {
    const id = last ? nextPracticeId(last.id, last.correct) : FIRST_PRACTICE;
    return respond(id ? findPractice(id) : null, 350);
  },

  async submitPracticeAttempt(id, given, unit) {
    const result = checkPractice(findPractice(id), given, unit);
    return respond({ ...result, masteryUpdates: practiceMasteryUpdates(id, result.correct) }, 600);
  },

  getSampleHistory: () => respond(sampleHistory, 200),
};
