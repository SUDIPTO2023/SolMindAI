import { z } from "zod";

// Core learning types. Each type is inferred from a Zod schema, so the
// same definition validates demo data now and API responses later.

export const TopicStatusSchema = z.enum(["mastered", "developing", "weak", "not_assessed"]);
export type TopicStatus = z.infer<typeof TopicStatusSchema>;

export const LearningModeSchema = z.enum(["learn_from_zero", "practice_and_improve", "advanced_challenge"]);
export type LearningMode = z.infer<typeof LearningModeSchema>;

export const TopicSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  summary: z.string().min(1),
  /** Position on the 2D concept map, in percent of the map's width and height. */
  layout: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
});
export type Topic = z.infer<typeof TopicSchema>;

export const PrerequisiteEdgeSchema = z.object({
  from: z.string().min(1), // the prerequisite
  to: z.string().min(1), // the topic that depends on it
});
export type PrerequisiteEdge = z.infer<typeof PrerequisiteEdgeSchema>;

export const KnowledgeGraphSchema = z.object({
  topics: z.array(TopicSchema),
  edges: z.array(PrerequisiteEdgeSchema),
  targetTopicId: z.string(),
});
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;

export const MasteryRecordSchema = z.object({
  topicId: z.string(),
  status: TopicStatusSchema,
  score: z.number().min(0).max(100),
});
export type MasteryRecord = z.infer<typeof MasteryRecordSchema>;

export const LearningObjectiveSchema = z.enum(["understand_second_law", "fix_force_mistakes", "exam_ready"]);
export type LearningObjective = z.infer<typeof LearningObjectiveSchema>;

export const LearningPreferencesSchema = z.object({
  explanationStart: z.enum(["everyday_example", "formula_first"]),
  hints: z.enum(["on_request", "after_mistake"]),
});
export type LearningPreferences = z.infer<typeof LearningPreferencesSchema>;

export const StudentNameSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters.")
  .max(40, "Keep the name under 40 characters.")
  .regex(/^[\p{L} .'-]+$/u, "Use letters and spaces only.");

export const StudentProfileSchema = z.object({
  name: StudentNameSchema,
  className: z.string(),
  subject: z.string(),
  chapter: z.string(),
  isDemoProfile: z.boolean(),
});
export type StudentProfile = z.infer<typeof StudentProfileSchema>;

export const LearningEventSchema = z.object({
  id: z.string(),
  type: z.enum(["onboarding", "mode", "assessment", "gap", "tutor", "practice", "mastery", "system"]),
  message: z.string(),
  tone: z.enum(["info", "success", "warning", "error"]),
  at: z.string(), // ISO timestamp
});
export type LearningEvent = z.infer<typeof LearningEventSchema>;
