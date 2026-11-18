import type { CurriculumNote, FoundationLesson } from "@/types/tutoring";

// Curated, locally stored teaching content. This stands in for curriculum
// retrieval (RAG), which is built after the demo. Every item names its source.

const SOURCE =
  "Curated note for Class 11 Physics, Newton’s Laws of Motion. Textbook page references are added once the board and edition are confirmed.";

export const CURRICULUM_NOTES: CurriculumNote[] = [
  {
    id: "CN-02",
    topicId: "second-law",
    title: "Newton’s second law uses the net force",
    body: "The acceleration of an object is in the direction of the net force on it, and equals the net force divided by the object’s mass. Forces in opposite directions are combined before the law is applied.",
    source: SOURCE,
  },
  {
    id: "CN-01",
    topicId: "net-force",
    title: "Combining forces along one line",
    body: "Forces acting in the same direction add. Forces acting in opposite directions subtract, and the net force points towards the larger one.",
    source: SOURCE,
  },
];

/** Zero-level lesson on net force. Verified: 40 − 15 = 25 N, 25 ÷ 5 = 5 m/s²; 12 − 5 = 7 N. */
export const NET_FORCE_LESSON: FoundationLesson = {
  topicId: "net-force",
  title: "Net force, from the basics",
  definition:
    "Net force is the one force you are left with after combining every force acting on an object. Forces in the same direction add. Forces in opposite directions subtract.",
  example:
    "Think of a tug of war. One team pulls with 500 N, the other with 450 N. The rope does not feel 950 N. It feels the 50 N difference, and moves towards the stronger team.",
  concept:
    "An object does not respond to each force separately. It responds to the total of all of them. That is why Newton’s second law uses the net force, not the biggest force or the one you applied by hand.",
  formulas: [
    { label: "Two forces in opposite directions", tex: String.raw`F_{\text{net}} = F_{\text{forward}} - F_{\text{backward}}` },
    { label: "Newton’s second law", tex: String.raw`a = \dfrac{F_{\text{net}}}{m}` },
  ],
  worked: {
    prompt: "A 5 kg sled is pulled with 40 N. Friction from the snow is 15 N. Find its acceleration.",
    steps: [
      String.raw`F_{\text{net}} = 40 - 15 = 25\ \text{N}`,
      String.raw`a = \dfrac{25}{5} = 5\ \text{m/s}^2`,
    ],
  },
  check: {
    id: "L1",
    topicId: "net-force",
    prompt: "A box is pulled right with 12 N and left with 5 N. What is the net force on the box?",
    difficulty: "Easy",
    bloom: "Understand",
    options: [
      { id: "a", label: "17 N to the right", correct: false },
      { id: "b", label: "7 N to the right", correct: true },
      { id: "c", label: "7 N to the left", correct: false },
    ],
    explanation: "Opposite forces subtract: 12 − 5 = 7 N, towards the larger force, so to the right.",
  },
  source: SOURCE,
};
