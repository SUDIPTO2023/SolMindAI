import type { PracticeQuestion } from "@/types/tutoring";

// Adaptive practice questions. Verified answers:
// P1 (18 − 6) ÷ 4 = 3   P2 (50 − 12 − 8) ÷ 6 = 5   PF 15 − 9 = 6   P3 (24 − 6) ÷ 3 = 6
export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "P1",
    topicId: "net-force",
    prompt: "A 4 kg object experiences an 18 N applied force and 6 N of opposing friction. Find its acceleration.",
    difficulty: "Medium",
    bloom: "Apply",
    answer: 3,
    unit: "m/s²",
    solutionTex: String.raw`F_{\text{net}} = 18 - 6 = 12\ \text{N},\quad a = \dfrac{12}{4} = 3\ \text{m/s}^2`,
    why: "Same idea as the diagnostic, with different numbers, so a remembered answer will not work.",
  },
  {
    id: "P2",
    topicId: "second-law",
    prompt: "A 6 kg trolley is pushed with 50 N. Friction of 12 N and air resistance of 8 N both oppose the motion. Find its acceleration.",
    difficulty: "Advanced",
    bloom: "Analyze",
    answer: 5,
    unit: "m/s²",
    solutionTex: String.raw`F_{\text{net}} = 50 - 12 - 8 = 30\ \text{N},\quad a = \dfrac{30}{6} = 5\ \text{m/s}^2`,
    why: "Your last answer was right without help, so the difficulty goes up one level: three forces instead of two.",
  },
  {
    id: "PF",
    topicId: "net-force",
    prompt: "A cart is pulled 15 N to the right and 9 N to the left. How large is the net force on the cart?",
    difficulty: "Easy",
    bloom: "Understand",
    answer: 6,
    unit: "N",
    solutionTex: String.raw`F_{\text{net}} = 15 - 9 = 6\ \text{N}\ \text{(to the right)}`,
    why: "Your last answer wasn’t right, so we step back to net force on its own, without the division.",
  },
  {
    id: "P3",
    topicId: "net-force",
    prompt: "A 3 kg box is pushed with 24 N against 6 N of friction. Find its acceleration.",
    difficulty: "Medium",
    bloom: "Apply",
    answer: 6,
    unit: "m/s²",
    solutionTex: String.raw`F_{\text{net}} = 24 - 6 = 18\ \text{N},\quad a = \dfrac{18}{3} = 6\ \text{m/s}^2`,
    why: "The foundation step went well, so we return to the original level.",
  },
];
