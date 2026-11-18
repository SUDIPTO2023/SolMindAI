import type { Misconception } from "@/types/assessment";

export const MISCONCEPTIONS: Misconception[] = [
  {
    id: "M05",
    topicId: "net-force",
    statement: "Treats the applied force as the net force and leaves out opposing forces.",
    followUpQuestion: "Which horizontal forces act on the block?",
  },
  {
    id: "M06",
    topicId: "friction",
    statement: "Adds friction to the applied force, as if friction helped the motion.",
    followUpQuestion: "Which way does friction act on a sliding block?",
  },
  {
    id: "M07",
    topicId: "second-law",
    statement: "Finds the net force but then uses a different force in a = F ÷ m.",
    followUpQuestion: "In a = F ÷ m, which force should F be?",
  },
  {
    id: "M08",
    topicId: "net-force",
    statement: "Knows friction acts on the block but does not subtract it before using a = F ÷ m.",
    followUpQuestion: "Which horizontal forces act on the block, and how did you use them?",
  },
];

export const misconceptionById = (id: string | null) =>
  MISCONCEPTIONS.find((m) => m.id === id) ?? null;
