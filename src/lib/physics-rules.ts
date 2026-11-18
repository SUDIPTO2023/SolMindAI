// Deterministic Physics validation for one-friction-force problems.
// No language model is involved: every result follows from fixed rules,
// so the same response always gets the same evaluation.

import type {
  DiagnosticEvaluation,
  ForceProblem,
  StudentResponse,
  ValidationCheck,
} from "@/types/assessment";

const TOLERANCE = 0.01;
const same = (a: number, b: number) => Math.abs(a - b) <= TOLERANCE;

interface Operation {
  a: number;
  op: "+" | "-" | "*" | "/";
  b: number;
  stated: number | null; // the result the student wrote, if any
  actual: number;
}

export function parseNumber(input: string): number | null {
  const v = Number.parseFloat(input.replace(",", ".").trim());
  return Number.isFinite(v) ? v : null;
}

/** Finds every "a op b" (optionally "= c") in the student's working. */
export function readOperations(working: string): Operation[] {
  const num = String.raw`(\d+(?:\.\d+)?)`;
  const calc = (a: number, op: Operation["op"], b: number) =>
    op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b;
  const ops: Operation[] = [];

  let text = working.replace(/÷/g, "/").replace(/[×x·]/g, "*").replace(/[−–—]/g, "-");

  // Bracketed parts first: "(30 + 10) / 5" records 30 + 10, then reads 40 / 5.
  const bracket = new RegExp(String.raw`\(\s*${num}\s*([+\-*/])\s*${num}\s*\)`);
  for (let m = text.match(bracket); m; m = text.match(bracket)) {
    const a = Number(m[1]);
    const op = m[2] as Operation["op"];
    const b = Number(m[3]);
    const actual = calc(a, op, b);
    ops.push({ a, op, b, stated: null, actual });
    text = text.replace(m[0], String(actual));
  }

  const pattern = new RegExp(String.raw`${num}\s*([+\-*/])\s*${num}(?:\s*=\s*${num})?`, "g");
  for (const m of text.matchAll(pattern)) {
    const a = Number(m[1]);
    const op = m[2] as Operation["op"];
    const b = Number(m[3]);
    ops.push({ a, op, b, stated: m[4] !== undefined ? Number(m[4]) : null, actual: calc(a, op, b) });
  }
  return ops;
}

const fmt = (n: number) => String(Math.round(n * 100) / 100);
const sym = { "+": "+", "-": "−", "*": "×", "/": "÷" } as const;

export function evaluateForceProblem(
  problem: ForceProblem,
  response: StudentResponse,
): DiagnosticEvaluation {
  const value = parseNumber(response.value);
  const ops = readOperations(response.working);
  const hasWorking = response.working.trim().length > 0;
  const net = problem.appliedForce - problem.frictionForce;

  const subtraction = ops.find(
    (o) => o.op === "-" && same(o.a, problem.appliedForce) && same(o.b, problem.frictionForce),
  );
  const division = ops.find((o) => o.op === "/" && same(o.b, problem.mass));
  const numerator = division?.a ?? null;
  const arithmeticSlips = ops.filter((o) => o.stated !== null && !same(o.stated, o.actual));

  const valueOk = value !== null && same(value, problem.answer);
  const unitOk = response.unit === problem.unit;
  const usedNet = numerator !== null && same(numerator, net);
  const usedApplied = numerator !== null && same(numerator, problem.appliedForce);
  const usedSum = numerator !== null && same(numerator, problem.appliedForce + problem.frictionForce);

  /* ---- individual checks ---------------------------------------- */
  const formula: ValidationCheck = !hasWorking
    ? { id: "formula", label: "Formula", passed: null, detail: "No working given, so the method cannot be seen." }
    : division
      ? { id: "formula", label: "Formula", passed: true, detail: `A force is divided by the ${problem.mass} kg mass, so a = F ÷ m is being used.` }
      : { id: "formula", label: "Formula", passed: false, detail: "No division by the mass appears, so a = F ÷ m is not visible in the working." };

  const netForce: ValidationCheck = !hasWorking || numerator === null
    ? { id: "net_force", label: "Net force", passed: null, detail: "Which force went into the formula cannot be read from the working." }
    : usedNet
      ? { id: "net_force", label: "Net force", passed: true, detail: `${problem.appliedForce} − ${problem.frictionForce} = ${net} N is the force used in the formula.` }
      : usedApplied
        ? {
            id: "net_force",
            label: "Net force",
            passed: false,
            detail: subtraction
              ? `The net force ${net} N was found, but the ${problem.appliedForce} N push was divided instead.`
              : `The ${problem.appliedForce} N push was divided alone. The ${problem.frictionForce} N friction does not appear.`,
          }
        : usedSum
          ? { id: "net_force", label: "Net force", passed: false, detail: "Friction was added to the push instead of subtracted." }
          : { id: "net_force", label: "Net force", passed: false, detail: `${fmt(numerator)} N is not the net force on the block.` };

  const arithmetic: ValidationCheck = ops.every((o) => o.stated === null)
    ? { id: "arithmetic", label: "Arithmetic", passed: null, detail: "No worked results to check." }
    : arithmeticSlips.length
      ? {
          id: "arithmetic",
          label: "Arithmetic",
          passed: false,
          detail: arithmeticSlips
            .map((o) => `${fmt(o.a)} ${sym[o.op]} ${fmt(o.b)} = ${fmt(o.actual)}, not ${fmt(o.stated ?? 0)}.`)
            .join(" "),
        }
      : { id: "arithmetic", label: "Arithmetic", passed: true, detail: "Every written calculation is correct." };

  const unit: ValidationCheck = unitOk
    ? { id: "unit", label: "Unit", passed: true, detail: `${problem.unit} is the correct unit for acceleration.` }
    : { id: "unit", label: "Unit", passed: false, detail: `${response.unit} is not a unit of acceleration. Use ${problem.unit}.` };

  const finalValue: ValidationCheck = {
    id: "final_value",
    label: "Final answer",
    passed: valueOk,
    detail: valueOk ? `${fmt(problem.answer)} ${problem.unit} is correct.` : `${value === null ? "No number" : fmt(value)} does not match the expected answer.`,
  };

  const checks = [formula, netForce, arithmetic, unit, finalValue];
  const base = {
    questionId: problem.id,
    isCorrect: valueOk && unitOk,
    given: { value, unit: response.unit },
    expected: { value: problem.answer, unit: problem.unit },
    checks,
  };
  const answerEvidence = `Answered ${value === null ? "nothing" : fmt(value)} ${response.unit}; expected ${fmt(problem.answer)} ${problem.unit}.`;

  /* ---- classification ------------------------------------------- */
  if (valueOk && unitOk) {
    return {
      ...base,
      gapType: "none",
      status: "not_applicable",
      confidence: "high",
      evidence: ["Correct value and unit."],
      possibleMisconceptionId: null,
      recommendedTopicId: null,
      nextAction: "Move to a harder question. One correct answer is not yet mastery.",
    };
  }

  if (valueOk && !unitOk) {
    return {
      ...base,
      gapType: "mathematical",
      status: "verified",
      confidence: "high",
      evidence: [`Correct value with the unit ${response.unit}.`],
      possibleMisconceptionId: null,
      recommendedTopicId: null,
      nextAction: "Correct the unit. The physics is right.",
    };
  }

  // Correct set-up, wrong calculation: objective evidence, so verified.
  if (usedNet && arithmeticSlips.length) {
    return {
      ...base,
      gapType: "mathematical",
      status: "verified",
      confidence: "high",
      evidence: [answerEvidence, "The net force is correct and used in the formula.", arithmetic.detail],
      possibleMisconceptionId: null,
      recommendedTopicId: null,
      nextAction: "Re-check the division, then practise the same method with new numbers.",
    };
  }

  // Net force found but not used in the formula: idea present, application missing.
  if (usedApplied && subtraction) {
    return {
      ...base,
      gapType: "mixed",
      status: "suspected",
      confidence: "medium",
      evidence: [answerEvidence, netForce.detail],
      possibleMisconceptionId: "M07",
      recommendedTopicId: "second-law",
      nextAction: "Ask which force belongs in a = F ÷ m before confirming.",
    };
  }

  // A wrong idea about forces is only suspected until a follow-up confirms it.
  if (usedApplied || usedSum || (!hasWorking && value !== null && (same(value, problem.appliedForce / problem.mass) || same(value, (problem.appliedForce + problem.frictionForce) / problem.mass)))) {
    const added = usedSum || (!hasWorking && value !== null && same(value, (problem.appliedForce + problem.frictionForce) / problem.mass));
    return {
      ...base,
      gapType: "conceptual",
      status: "suspected",
      confidence: hasWorking ? "medium" : "low",
      evidence: hasWorking ? [answerEvidence, netForce.detail] : [answerEvidence, "The value matches a common mistake, but no working was given."],
      possibleMisconceptionId: added ? "M06" : "M05",
      recommendedTopicId: added ? "friction" : "net-force",
      nextAction: "Ask a follow-up question before confirming the gap.",
    };
  }

  return {
    ...base,
    gapType: "insufficient_evidence",
    status: "uncertain",
    confidence: "low",
    evidence: [answerEvidence, "The response does not match a recognised pattern."],
    possibleMisconceptionId: null,
    recommendedTopicId: "net-force",
    nextAction: "Ask for the working, or start from the foundation of net force.",
  };
}
