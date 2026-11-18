// Scripted Socratic tutoring. The script is built from the problem's own
// numbers, so it works for every diagnostic question. Replies are matched
// with fixed patterns; no language model is involved.

import type { ForceProblem, GapEvidence } from "@/types/assessment";
import type { LearningPreferences } from "@/types/learning";
import type { TutorChip, TutorMessageDraft, TutorTurn } from "@/types/tutoring";

export interface SocraticStep {
  ask: string;
  chips: TutorChip[];
  accept: string; // regular-expression source for typed replies
  nudge: string;
  confirm: string;
  confirmTex?: string;
  hints: [string, string, string]; // concept, formula, step
}

const HINT_KIND = ["Concept", "Formula", "Step"] as const;
const num = (n: number) => String(Math.round(n * 100) / 100);
const exact = (n: number) => String.raw`(^|[^0-9.])${num(n).replace(".", "\\.")}([^0-9]|$)`;

export function socraticSteps(p: ForceProblem): SocraticStep[] {
  const a = p.appliedForce;
  const f = p.frictionForce;
  const m = p.mass;
  const net = a - f;
  return [
    {
      ask: `Let’s leave the formula aside for a moment. Along the floor, which forces act on the ${m} kg object?`,
      chips: [
        { label: `Just the ${a} N push`, kind: "wrong" },
        { label: "The push and friction", kind: "correct" },
        { label: "I’m not sure", kind: "help" },
      ],
      accept: "friction",
      nudge: "The push is one of them. Picture the object sliding across a rough floor. Does the floor do anything to it?",
      confirm: `Yes. Two forces act along the floor: the ${a} N push and ${f} N of friction.`,
      hints: [
        "Think about what a rough floor does to anything sliding across it.",
        "Along the floor there is F(applied) forward, and f (friction) backward.",
        `Read the problem again: ${f} N of friction opposes the motion.`,
      ],
    },
    {
      ask: "What happens to the applied force when friction acts in the opposite direction?",
      chips: [
        { label: "They add together", kind: "wrong" },
        { label: "I need to subtract the frictional force", kind: "correct" },
        { label: "I’m not sure", kind: "help" },
      ],
      accept: "subtract|minus|take away|takes away|less|reduc|cancel|oppos|against",
      nudge: "Think about what friction does to something that is sliding. Does it help the push, or hold it back?",
      confirm: "Correct. Friction works against the push, so it takes away from it.",
      hints: [
        "Friction always acts against the sliding.",
        "For opposite forces: F(net) = F(forward) − F(backward).",
        `The push is forward and friction is backward, so it is ${a} − ${f}.`,
      ],
    },
    {
      ask: "So what is the resulting net force?",
      chips: [
        { label: `${a + f} N`, kind: "wrong" },
        { label: `${a} N`, kind: "wrong" },
        { label: `${net} N`, kind: "correct" },
      ],
      accept: exact(net),
      nudge: "Not quite. When two forces point in opposite directions, the smaller one cancels part of the larger one.",
      confirm: "Exactly. That leftover force is the net force.",
      confirmTex: String.raw`F_{\text{net}} = ${a} - ${f} = ${net}\ \text{N}`,
      hints: [
        "When two forces oppose each other, only the difference is left over.",
        "F(net) = F(applied) − f",
        `${a} − ${f} = ?`,
      ],
    },
    {
      ask: "Now the formula. In a = F ÷ m, which force should F be?",
      chips: [
        { label: `The ${a} N push`, kind: "wrong" },
        { label: `The ${net} N net force`, kind: "correct" },
      ],
      accept: `net|${exact(net)}`,
      nudge: "The object doesn’t feel the push on its own. Which number already includes every force on it?",
      confirm: "Yes. Newton’s second law always uses the net force.",
      confirmTex: String.raw`a = \dfrac{F_{\text{net}}}{m}`,
      hints: [
        "The object responds to all of its forces together, not one at a time.",
        "a = F(net) ÷ m",
        `Use the ${net} N you just worked out.`,
      ],
    },
    {
      ask: `Then what is the acceleration of the ${m} kg object?`,
      chips: [
        { label: `${num(a / m)} m/s²`, kind: "wrong" },
        { label: `${num(p.answer)} m/s²`, kind: "correct" },
      ],
      accept: exact(p.answer),
      nudge: "Check which force you divided. It should be the net force.",
      confirm: "That’s it, and you worked it out yourself. The only missing piece earlier was combining the forces before dividing.",
      confirmTex: String.raw`a = \dfrac{${net}}{${m}} = ${num(p.answer)}\ \text{m/s}^2`,
      hints: [
        "Acceleration is the net force shared over the mass.",
        "a = F(net) ÷ m",
        `${net} ÷ ${m} = ?`,
      ],
    },
  ];
}

export function introFor(gap: GapEvidence | null): string {
  if (!gap) return "Let’s work through a force problem together. I’ll ask, you answer, one step at a time.";
  switch (gap.gapType) {
    case "conceptual":
    case "mixed":
      return "Your diagnostic found a gap in how the forces were combined. Let’s rebuild that idea together. I’ll ask, you answer, one step at a time.";
    case "mathematical":
      return "Your diagnostic showed the idea is right and the slip was in the calculation. Let’s walk through each step slowly, so you can see where it goes.";
    case "none":
      return "You answered the diagnostic correctly. Let’s make sure the reasoning behind it is solid before harder problems.";
    default:
      return "The diagnostic couldn’t tell yet where the difficulty is, so let’s go step by step and find out together.";
  }
}

export function openingMessages(p: ForceProblem, gap: GapEvidence | null, prefs: LearningPreferences): TutorMessageDraft[] {
  const intro: TutorMessageDraft = { role: "tutor", kind: "intro", text: introFor(gap) };
  if (prefs.explanationStart === "formula_first") {
    intro.text += " Here is the law we are building towards:";
    intro.tex = String.raw`a = \dfrac{F_{\text{net}}}{m}`;
  }
  return [
    intro,
    { role: "tutor", kind: "problem", text: p.prompt },
    { role: "tutor", kind: "question", text: socraticSteps(p)[0].ask },
  ];
}

export function hintMessage(p: ForceProblem, step: number, level: number): TutorMessageDraft | null {
  const s = socraticSteps(p)[step];
  if (!s || level < 1 || level > 3) return null;
  return { role: "tutor", kind: "hint", hintLevel: level, text: `${HINT_KIND[level - 1]}: ${s.hints[level - 1]}` };
}

const HELP = /^\s*(hint|help|i ?don.?t know|not sure|i.?m not sure|idk)\b/i;

export function respond(input: {
  problem: ForceProblem;
  step: number;
  text: string;
  chipKind?: TutorChip["kind"];
  hintLevel: number;
  prefs: LearningPreferences;
}): TutorTurn {
  const steps = socraticSteps(input.problem);
  const s = steps[input.step];
  if (!s) return { messages: [], advance: false, done: true, hintUsed: false };

  const nextHint = () => hintMessage(input.problem, input.step, input.hintLevel + 1);
  const wantsHelp = input.chipKind === "help" || (!input.chipKind && HELP.test(input.text));
  if (wantsHelp) {
    const h = nextHint();
    return h
      ? { messages: [h], advance: false, done: false, hintUsed: true }
      : { messages: [{ role: "tutor", kind: "nudge", text: "You’ve seen all three hints for this step. Try an answer. A wrong one is fine; it tells us where to look." }], advance: false, done: false, hintUsed: false };
  }

  const ok = input.chipKind ? input.chipKind === "correct" : new RegExp(s.accept, "i").test(input.text);
  if (!ok) {
    const messages: TutorMessageDraft[] = [{ role: "tutor", kind: "nudge", text: s.nudge }];
    const autoHint = input.prefs.hints === "after_mistake" ? nextHint() : null;
    if (autoHint) messages.push(autoHint);
    return { messages, advance: false, done: false, hintUsed: !!autoHint };
  }

  const next = steps[input.step + 1];
  const messages: TutorMessageDraft[] = [{ role: "tutor", kind: "confirm", text: s.confirm, tex: s.confirmTex }];
  if (next) messages.push({ role: "tutor", kind: "question", text: next.ask });
  return { messages, advance: !!next, done: !next, hintUsed: false };
}
