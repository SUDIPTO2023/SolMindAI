// The adaptive challenge rules, kept deliberately simple and visible:
// a correct answer moves up one level, a miss steps back to the foundation.
// Topics can reach Developing here, never Mastered.

import { parseNumber } from "@/lib/physics-rules";
import type { Unit } from "@/types/assessment";
import type { MasteryRecord } from "@/types/learning";
import type { PracticeId, PracticeQuestion } from "@/types/tutoring";

export const FIRST_PRACTICE: PracticeId = "P1";

export function nextPracticeId(last: PracticeId, correct: boolean): PracticeId | null {
  switch (last) {
    case "P1":
      return correct ? "P2" : "PF";
    case "PF":
      return "P3";
    case "P3":
      return correct ? "P2" : null;
    default:
      return null;
  }
}

export function checkPractice(q: PracticeQuestion, given: string, unit: Unit) {
  const value = parseNumber(given);
  const valueOk = value !== null && Math.abs(value - q.answer) <= 0.01;
  const unitOk = unit === q.unit;
  const feedback = valueOk && unitOk
    ? "Correct, and solved without hints."
    : valueOk
      ? `The number is right, but the unit should be ${q.unit}.`
      : "Not this time. Compare your steps with the worked solution.";
  return { correct: valueOk && unitOk, valueOk, unitOk, feedback };
}

/** Mastery changes from one practice answer. Wrong answers never lower a topic here. */
export function practiceMasteryUpdates(id: PracticeId, correct: boolean): MasteryRecord[] {
  if (!correct) return [];
  switch (id) {
    case "P1":
      return [
        { topicId: "net-force", status: "developing", score: 60 },
        { topicId: "friction", status: "developing", score: 58 },
      ];
    case "P3":
      return [
        { topicId: "net-force", status: "developing", score: 58 },
        { topicId: "friction", status: "developing", score: 56 },
      ];
    case "PF":
      return [{ topicId: "net-force", status: "weak", score: 45 }];
    case "P2":
      return [{ topicId: "second-law", status: "developing", score: 62 }];
  }
}
