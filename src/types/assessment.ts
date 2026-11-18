import { z } from "zod";

export const DifficultySchema = z.enum(["Easy", "Medium", "Advanced", "Expert"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const BloomLevelSchema = z.enum(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]);
export type BloomLevel = z.infer<typeof BloomLevelSchema>;

export const UnitSchema = z.enum(["m/s²", "m/s", "N", "kg"]);
export type Unit = z.infer<typeof UnitSchema>;

/** A Newton's second law problem with one applied force and one opposing friction force. */
export const ForceProblemSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  prompt: z.string(),
  difficulty: DifficultySchema,
  bloom: BloomLevelSchema,
  mass: z.number().positive(),
  appliedForce: z.number().positive(),
  frictionForce: z.number().nonnegative(),
  answer: z.number(),
  unit: UnitSchema,
  curriculumRef: z.string(),
});
export type ForceProblem = z.infer<typeof ForceProblemSchema>;

export const StudentResponseSchema = z.object({
  value: z.string(),
  unit: UnitSchema,
  working: z.string(),
});
export type StudentResponse = z.infer<typeof StudentResponseSchema>;

export const GapTypeSchema = z.enum(["conceptual", "mathematical", "mixed", "none", "insufficient_evidence"]);
export type GapType = z.infer<typeof GapTypeSchema>;

export const EvidenceStatusSchema = z.enum(["suspected", "verified", "uncertain", "not_applicable"]);
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;

export const ValidationCheckSchema = z.object({
  id: z.enum(["formula", "net_force", "arithmetic", "unit", "final_value"]),
  label: z.string(),
  passed: z.boolean().nullable(), // null = could not be judged from the response
  detail: z.string(),
});
export type ValidationCheck = z.infer<typeof ValidationCheckSchema>;

export const DiagnosticEvaluationSchema = z.object({
  questionId: z.string(),
  isCorrect: z.boolean(),
  given: z.object({ value: z.number().nullable(), unit: UnitSchema }),
  expected: z.object({ value: z.number(), unit: UnitSchema }),
  checks: z.array(ValidationCheckSchema),
  gapType: GapTypeSchema,
  status: EvidenceStatusSchema,
  confidence: z.enum(["low", "medium", "high"]),
  evidence: z.array(z.string()),
  possibleMisconceptionId: z.string().nullable(),
  recommendedTopicId: z.string().nullable(),
  nextAction: z.string(),
});
export type DiagnosticEvaluation = z.infer<typeof DiagnosticEvaluationSchema>;

export const MisconceptionSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  statement: z.string(),
  followUpQuestion: z.string(),
});
export type Misconception = z.infer<typeof MisconceptionSchema>;

/* ---- Phase 3: diagnostic session ------------------------------- */

export const ReadinessLevelSchema = z.enum(["ready", "partially_ready", "foundation_needed"]);
export type ReadinessLevel = z.infer<typeof ReadinessLevelSchema>;

export const ChoiceQuestionSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  prompt: z.string(),
  difficulty: DifficultySchema,
  bloom: BloomLevelSchema,
  options: z.array(z.object({ id: z.string(), label: z.string(), correct: z.boolean() })).min(2),
  explanation: z.string(),
});
export type ChoiceQuestion = z.infer<typeof ChoiceQuestionSchema>;

export const HintSchema = z.object({
  level: z.number().int().min(1).max(3),
  kind: z.enum(["concept", "formula", "step"]),
  text: z.string(),
});
export type Hint = z.infer<typeof HintSchema>;

export const FollowUpQuestionSchema = z.object({
  id: z.enum(["forces", "friction_direction", "which_force"]),
  prompt: z.string(),
  options: z.array(z.object({ id: z.string(), label: z.string() })),
});
export type FollowUpQuestion = z.infer<typeof FollowUpQuestionSchema>;

export const GapEvidenceSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  gapType: GapTypeSchema,
  status: EvidenceStatusSchema,
  confidence: z.enum(["low", "medium", "high"]),
  evidence: z.array(z.string()),
  misconceptionId: z.string().nullable(),
  recommendedTopicId: z.string().nullable(),
  nextAction: z.string(),
  followUpAnswer: z.string().nullable(),
  at: z.string(),
});
export type GapEvidence = z.infer<typeof GapEvidenceSchema>;

export const QuestionAttemptSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  topicId: z.string(),
  label: z.string(),
  correct: z.boolean(),
  difficulty: DifficultySchema,
  bloom: BloomLevelSchema,
  gapType: GapTypeSchema.nullable(),
  hintsUsed: z.number().int().min(0),
  at: z.string(),
  isSample: z.boolean(),
});
export type QuestionAttempt = z.infer<typeof QuestionAttemptSchema>;
