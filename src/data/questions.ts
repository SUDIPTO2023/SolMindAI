import type { ChoiceQuestion, ForceProblem } from "@/types/assessment";

/** The main diagnostic question used across the demo. Verified: (30 − 10) ÷ 5 = 4 m/s². */
export const MAIN_DIAGNOSTIC: ForceProblem = {
  id: "Q001",
  topicId: "second-law",
  prompt:
    "A 5 kg block is pushed with a force of 30 N. A frictional force of 10 N opposes its motion. Find its acceleration.",
  difficulty: "Medium",
  bloom: "Apply",
  mass: 5,
  appliedForce: 30,
  frictionForce: 10,
  answer: 4,
  unit: "m/s²",
  curriculumRef: "Class 11 Physics, Newton's Laws of Motion: second law with friction",
};

/**
 * Diagnostic questions in the order "Try Another Question" moves through them.
 * Each one is checked by the same rules. Verified: (45 − 15) ÷ 10 = 3, (17 − 5) ÷ 2 = 6.
 */
export const DIAGNOSTIC_QUESTIONS: ForceProblem[] = [
  MAIN_DIAGNOSTIC,
  {
    id: "Q002",
    topicId: "second-law",
    prompt:
      "A 10 kg crate is pulled across a floor with a force of 45 N. Friction of 15 N opposes the motion. Find the crate's acceleration.",
    difficulty: "Medium",
    bloom: "Apply",
    mass: 10,
    appliedForce: 45,
    frictionForce: 15,
    answer: 3,
    unit: "m/s²",
    curriculumRef: "Class 11 Physics, Newton's Laws of Motion: second law with friction",
  },
  {
    id: "Q003",
    topicId: "second-law",
    prompt:
      "A 2 kg box is pushed with a force of 17 N while 5 N of friction acts against it. Find the box's acceleration.",
    difficulty: "Medium",
    bloom: "Apply",
    mass: 2,
    appliedForce: 17,
    frictionForce: 5,
    answer: 6,
    unit: "m/s²",
    curriculumRef: "Class 11 Physics, Newton's Laws of Motion: second law with friction",
  },
];

/** Prerequisite readiness check for Newton's second law. */
export const READINESS_QUESTIONS: ChoiceQuestion[] = [
  {
    id: "R1",
    topicId: "force",
    prompt: "Two people push a box in the same direction, with 15 N and 10 N. What is the net force on the box?",
    difficulty: "Easy",
    bloom: "Remember",
    options: [
      { id: "a", label: "5 N", correct: false },
      { id: "b", label: "25 N", correct: true },
      { id: "c", label: "150 N", correct: false },
      { id: "d", label: "It depends on the box’s mass", correct: false },
    ],
    explanation: "Forces in the same direction add: 15 + 10 = 25 N.",
  },
  {
    id: "R2",
    topicId: "net-force",
    prompt: "A cart is pulled right with 20 N and left with 8 N. What is the net force on the cart?",
    difficulty: "Easy",
    bloom: "Understand",
    options: [
      { id: "a", label: "28 N to the right", correct: false },
      { id: "b", label: "12 N to the right", correct: true },
      { id: "c", label: "12 N to the left", correct: false },
      { id: "d", label: "20 N to the right", correct: false },
    ],
    explanation: "Opposite forces subtract: 20 − 8 = 12 N, towards the larger force.",
  },
];
