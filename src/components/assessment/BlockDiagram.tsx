"use client";

import type { ForceProblem } from "@/types/assessment";
import { useLanguage } from "@/i18n/use-language";

/** The object on a rough floor with the applied force. Friction is stated in the question, not drawn. */
export function BlockDiagram({ problem }: { problem: ForceProblem }) {
  const i18n = useLanguage();
  return (
    <svg viewBox="0 0 360 160" className="w-full" role="img" aria-label={i18n.tx(`A ${problem.mass} kilogram object on a rough floor, pushed to the right with ${problem.appliedForce} newtons.`)}>
      <line x1="16" y1="122" x2="344" y2="122" stroke="#64748B" strokeWidth="2" />
      {Array.from({ length: 17 }).map((_, i) => (
        <line key={i} x1={26 + i * 19} y1="122" x2={16 + i * 19} y2="133" stroke="#64748B" strokeOpacity="0.6" strokeWidth="1.4" />
      ))}
      <text x="344" y="150" textAnchor="end" fill="var(--color-muted)" fontSize="11" fontFamily="var(--font-geist-mono)">{i18n.t("rough floor")}</text>
      <rect x="150" y="62" width="84" height="60" rx="6" fill="var(--color-elevated)" stroke="#8B5CF6" strokeWidth="2" />
      <text x="192" y="98" textAnchor="middle" fill="var(--color-text)" fontSize="16" fontWeight="600">{problem.mass} kg</text>
      <path d="M 44 92 H 136" stroke="#3B82F6" strokeWidth="4" />
      <path d="M 140 92 l -13 -8 v 16 z" fill="#3B82F6" />
      <text x="88" y="80" textAnchor="middle" fill="var(--color-blue-soft)" fontSize="13" fontWeight="600">{problem.appliedForce} N</text>
    </svg>
  );
}
