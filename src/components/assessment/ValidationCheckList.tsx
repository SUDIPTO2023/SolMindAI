"use client";

import { motion } from "motion/react";
import { Check, CircleHelp, X } from "lucide-react";
import type { ValidationCheck } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

/** The step-by-step result of the deterministic Physics checks. */
export function ValidationCheckList({ checks, stagger = 0.12 }: { checks: ValidationCheck[]; stagger?: number }) {
  const i18n = useLanguage();
  return (
    <ul className="space-y-3">
      {checks.map((c, i) => (
        <motion.li
          key={c.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * stagger }}
          className="flex gap-3"
        >
          <span
            className={cn(
              "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
              c.passed === true && "bg-success/15 text-ok-ink",
              c.passed === false && "bg-error/15 text-bad-ink",
              c.passed === null && "bg-ink/[0.06] text-muted",
            )}
          >
            {c.passed === true ? <Check size={14} /> : c.passed === false ? <X size={14} /> : <CircleHelp size={14} />}
            <span className="sr-only">{i18n.tx(c.passed === true ? "passed" : c.passed === false ? "failed" : "not judged")}</span>
          </span>
          <span className="text-sm">
            <span className="font-medium">{i18n.tx(c.label)}. </span>
            <span className="text-muted">{i18n.tx(c.detail)}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
