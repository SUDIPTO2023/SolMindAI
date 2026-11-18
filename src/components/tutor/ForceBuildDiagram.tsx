"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ForceProblem } from "@/types/assessment";
import { useLanguage } from "@/i18n/use-language";

/** The object as the student describes it: each force is drawn once they name it. */
export function ForceBuildDiagram({ problem, friction, net }: { problem: ForceProblem; friction: boolean; net: boolean }) {
  const i18n = useLanguage();
  const draw = { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 0.6 } };
  const netForce = problem.appliedForce - problem.frictionForce;
  return (
    <svg
      viewBox="0 0 320 170"
      className="w-full"
      role="img"
      aria-label={i18n.tx(`The ${problem.mass} kg object with a ${problem.appliedForce} newton push${friction ? `, ${problem.frictionForce} newtons of friction` : ""}${net ? `, and a ${netForce} newton net force` : ""}.`)}
    >
      <line x1="10" y1="130" x2="310" y2="130" stroke="#64748B" strokeWidth="2" />
      <rect x="125" y="72" width="70" height="58" rx="6" fill="var(--color-elevated)" stroke="#8B5CF6" strokeWidth="2" />
      <text x="160" y="106" textAnchor="middle" fill="var(--color-text)" fontSize="14" fontWeight="600">{problem.mass} kg</text>
      <path d="M 28 100 H 113" stroke="#3B82F6" strokeWidth="4" />
      <path d="M 117 100 l -12 -7 v 14 z" fill="#3B82F6" />
      <text x="70" y="88" textAnchor="middle" fill="var(--color-blue-soft)" fontSize="12" fontWeight="600">{i18n.t("push")}{" "}{problem.appliedForce} N</text>
      <AnimatePresence>
        {friction && (
          <motion.g key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.path d="M 290 118 H 207" stroke="#EF4444" strokeWidth="4" fill="none" {...draw} />
            <path d="M 203 118 l 12 -7 v 14 z" fill="#EF4444" />
            <text x="250" y="106" textAnchor="middle" fill="var(--color-bad-soft)" fontSize="12" fontWeight="600">{i18n.t("friction")}{" "}{problem.frictionForce} N</text>
          </motion.g>
        )}
        {net && (
          <motion.g key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.path d="M 128 46 H 188" stroke="#16A34A" strokeWidth="4" fill="none" {...draw} />
            <path d="M 192 46 l -12 -7 v 14 z" fill="#16A34A" />
            <text x="160" y="30" textAnchor="middle" fill="var(--color-ok-soft)" fontSize="12" fontWeight="600">{i18n.t("net force")}{" "}{netForce} N</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
