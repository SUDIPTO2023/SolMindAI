import type { LearningMode, LearningObjective, LearningPreferences } from "@/types/learning";

export const LEARNING_MODES: {
  id: LearningMode;
  title: string;
  level: string;
  summary: string;
  firstStep: string;
}[] = [
  {
    id: "learn_from_zero",
    title: "Learn from Zero",
    level: "Beginner",
    summary: "Start from the basic idea, in plain words, before any numbers.",
    firstStep:
      "A short readiness check. If a foundation is missing, SOLMIND opens a plain-language lesson before any problem.",
  },
  {
    id: "practice_and_improve",
    title: "Practice & Improve",
    level: "Intermediate",
    summary: "Solve problems and get help aimed at exactly what went wrong.",
    firstStep:
      "A readiness check, then one diagnostic problem with your working, so SOLMIND can see how you solve it.",
  },
  {
    id: "advanced_challenge",
    title: "Advanced Challenge",
    level: "Advanced",
    summary: "Harder, multi-step problems once your foundations are confirmed.",
    firstStep:
      "Choosing this does not prove mastery. The diagnostic checks your foundations first, then harder problems unlock.",
  },
];

export const OBJECTIVES: { id: LearningObjective; title: string; detail: string }[] = [
  { id: "understand_second_law", title: "Understand Newton’s second law", detail: "Know why a = F ÷ m works, not just how to use it." },
  { id: "fix_force_mistakes", title: "Stop making mistakes in force problems", detail: "Find out what keeps going wrong, and fix that." },
  { id: "exam_ready", title: "Get ready for exams", detail: "Practise mixed problems at exam difficulty." },
];

export const PREFERENCE_OPTIONS: {
  key: keyof LearningPreferences;
  question: string;
  options: { value: LearningPreferences[keyof LearningPreferences]; label: string }[];
}[] = [
  {
    key: "explanationStart",
    question: "How should explanations start?",
    options: [
      { value: "everyday_example", label: "With an everyday example" },
      { value: "formula_first", label: "With the formula" },
    ],
  },
  {
    key: "hints",
    question: "When should hints appear?",
    options: [
      { value: "on_request", label: "Only when I ask" },
      { value: "after_mistake", label: "Offer one after a mistake" },
    ],
  },
];

export const DEFAULT_PREFERENCES: LearningPreferences = {
  explanationStart: "everyday_example",
  hints: "on_request",
};

export const modeById = (id: LearningMode | null) => LEARNING_MODES.find((m) => m.id === id) ?? null;
export const objectiveById = (id: LearningObjective | null) => OBJECTIVES.find((o) => o.id === id) ?? null;
