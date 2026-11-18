import { z } from "zod";
import { BloomLevelSchema, ChoiceQuestionSchema, DifficultySchema, UnitSchema } from "./assessment";

export const TutorMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["tutor", "student"]),
  text: z.string(),
  tex: z.string().optional(), // a formula shown under the text
  kind: z.enum(["intro", "problem", "question", "confirm", "nudge", "hint"]).optional(),
  hintLevel: z.number().int().min(1).max(3).optional(),
});
export type TutorMessage = z.infer<typeof TutorMessageSchema>;
export type TutorMessageDraft = Omit<TutorMessage, "id">;

export interface TutorChip {
  label: string;
  kind: "correct" | "wrong" | "help";
}

export interface TutorTurn {
  messages: TutorMessageDraft[];
  advance: boolean; // move to the next Socratic step
  done: boolean; // the guided session is finished
  hintUsed: boolean;
}

export const PracticeQuestionSchema = z.object({
  id: z.enum(["P1", "P2", "PF", "P3"]),
  topicId: z.string(),
  prompt: z.string(),
  difficulty: DifficultySchema,
  bloom: BloomLevelSchema,
  answer: z.number(),
  unit: UnitSchema,
  solutionTex: z.string(),
  why: z.string(),
});
export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;
export type PracticeId = PracticeQuestion["id"];

export const PracticeResultSchema = z.object({
  id: PracticeQuestionSchema.shape.id,
  given: z.string(),
  unit: UnitSchema,
  correct: z.boolean(),
  unitOk: z.boolean(),
  at: z.string(),
});
export type PracticeResult = z.infer<typeof PracticeResultSchema>;

export const CurriculumNoteSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  title: z.string(),
  body: z.string(),
  source: z.string(),
});
export type CurriculumNote = z.infer<typeof CurriculumNoteSchema>;

export const FoundationLessonSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  definition: z.string(),
  example: z.string(),
  concept: z.string(),
  formulas: z.array(z.object({ label: z.string(), tex: z.string() })),
  worked: z.object({ prompt: z.string(), steps: z.array(z.string()) }),
  check: ChoiceQuestionSchema,
  source: z.string(),
});
export type FoundationLesson = z.infer<typeof FoundationLessonSchema>;
