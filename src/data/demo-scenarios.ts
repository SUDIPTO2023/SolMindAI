import type { QuestionAttempt, StudentResponse } from "@/types/assessment";
import type { MasteryRecord, StudentProfile } from "@/types/learning";

/** The one fictional learner used throughout the demo. */
export const DEMO_STUDENT: StudentProfile = {
  name: "Ayaan Rahman",
  className: "Class 11",
  subject: "Physics",
  chapter: "Newton's Laws of Motion",
  isDemoProfile: true,
};

/** Where the demo learner starts. Clearly labelled as sample data in the UI. */
export const BASELINE_MASTERY: MasteryRecord[] = [
  { topicId: "vectors", status: "mastered", score: 84 },
  { topicId: "mass", status: "developing", score: 61 },
  { topicId: "force", status: "developing", score: 64 },
  { topicId: "friction", status: "not_assessed", score: 0 },
  { topicId: "fbd", status: "not_assessed", score: 0 },
  { topicId: "first-law", status: "developing", score: 58 },
  { topicId: "third-law", status: "not_assessed", score: 0 },
  { topicId: "net-force", status: "not_assessed", score: 0 },
  { topicId: "algebra", status: "mastered", score: 86 },
  { topicId: "acceleration", status: "mastered", score: 82 },
  { topicId: "second-law", status: "not_assessed", score: 0 },
];

export interface GapCase {
  id: "conceptual" | "mathematical";
  tab: string;
  student: string;
  response: StudentResponse;
  intervention: { title: string; steps: string[] };
}

/** The two sample responses used by the landing-page preview. */
export const GAP_CASES: GapCase[] = [
  {
    id: "conceptual",
    tab: "Conceptual gap",
    student: "Student A",
    response: { value: "6", unit: "m/s²", working: "a = F / m\na = 30 / 5 = 6" },
    intervention: {
      title: "Rebuild the idea of net force",
      steps: [
        "Ask which forces act on the block before any formula.",
        "Draw the push and the friction as opposite arrows.",
        "Combine them into one net force, then apply a = F ÷ m.",
      ],
    },
  },
  {
    id: "mathematical",
    tab: "Mathematical gap",
    student: "Student B",
    response: { value: "5", unit: "m/s²", working: "F = 30 - 10 = 20\na = 20 / 5 = 5" },
    intervention: {
      title: "Keep the method, fix the step",
      steps: [
        "Confirm that the physics set-up is already correct.",
        "Point to the one step that does not hold: 20 ÷ 5.",
        "Practise the same calculation with new numbers.",
      ],
    },
  },
];

/** The scripted diagnostic story shown in the landing-page hero. */
export const HERO_STORY: { title: string; detail: string; netForce: "not_assessed" | "weak" | "developing" }[] = [
  { title: "Answer received", detail: "a = 6 m/s², expected 4 m/s²", netForce: "not_assessed" },
  { title: "Working checked", detail: "30 ÷ 5 uses the push alone", netForce: "not_assessed" },
  { title: "Suspected gap", detail: "Friction left out of net force", netForce: "weak" },
  { title: "Follow-up confirms", detail: "Named only the 30 N push", netForce: "weak" },
  { title: "Guided practice", detail: "New problem solved correctly", netForce: "developing" },
];

/**
 * Earlier answers by the fictional sample learner, shown in Analytics only
 * when "Include sample history" is on. Illustrative, never mixed into the
 * session record, so they never count as evidence on the knowledge map.
 */
const sample = (
  n: number, questionId: string, topicId: string, label: string, correct: boolean,
  difficulty: QuestionAttempt["difficulty"], bloom: QuestionAttempt["bloom"],
  hintsUsed: number, gapType: QuestionAttempt["gapType"], day: number,
): QuestionAttempt => ({
  id: `sample-${n}`, questionId, topicId, label, correct, difficulty, bloom, gapType, hintsUsed,
  at: `2026-11-${String(day).padStart(2, "0")}T0${(n % 6) + 3}:15:00.000Z`, isSample: true,
});

export const SAMPLE_ATTEMPTS: QuestionAttempt[] = [
  sample(1, "SC01", "force", "Identify a push and a pull", true, "Easy", "Remember", 0, null, 9),
  sample(2, "SC02", "vectors", "Add two vectors on a line", true, "Easy", "Understand", 0, null, 9),
  sample(3, "SP01", "algebra", "Rearrange F = ma for m", true, "Easy", "Apply", 0, "none", 10),
  sample(4, "SC03", "mass", "Inertia of a heavy trolley", false, "Medium", "Understand", 0, null, 10),
  sample(5, "SP02", "acceleration", "Acceleration from two speeds", true, "Medium", "Apply", 0, "none", 11),
  sample(6, "SC04", "first-law", "Motion with no net force", true, "Medium", "Understand", 1, null, 11),
  sample(7, "SP03", "acceleration", "Acceleration with a unit slip", false, "Medium", "Apply", 0, "mathematical", 12),
  sample(8, "SP04", "force", "Total force from two pushes", true, "Medium", "Apply", 1, "none", 12),
  sample(9, "SP05", "mass", "Compare accelerations of two masses", false, "Advanced", "Analyze", 2, "conceptual", 13),
  sample(10, "SC05", "vectors", "Opposite vectors on a line", true, "Medium", "Understand", 0, null, 13),
];
