"use client";

import { AnimatePresence, motion } from "motion/react";
import { HERO_STORY } from "@/data/demo-scenarios";
import { STATUS_META } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/i18n/use-language";

/** Glass panel beside the 3D network: the diagnostic story, one step at a time. */
export function DiagnosticInsightPanel({ step }: { step: number }) {
  const i18n = useLanguage();
  const current = HERO_STORY[step];
  const status = STATUS_META[current.netForce];
  return (
    <div className="glass p-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{i18n.t("Diagnostic insight")}</p>
        <Badge>{i18n.t("Demo scenario")}</Badge>
      </div>

      <ol className="mt-3 flex gap-1" aria-hidden="true">
        {HERO_STORY.map((s, i) => (
          <li key={s.title} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
            <motion.span
              className="block h-full bg-[image:var(--gradient-primary)]"
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.4 }}
            />
          </li>
        ))}
      </ol>

      <div className="mt-3 min-h-[52px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-medium">{i18n.tx(current.title)}</p>
            <p className="font-mono text-[13px] text-muted">{i18n.tx(current.detail)}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
        <span className="text-muted">{i18n.t("Net Force")}</span>
        <span className="inline-flex items-center gap-2 font-medium" style={{ color: status.ink }}>
          <span className="h-2 w-2 rounded-full" style={{ background: status.color }} />
          {i18n.tx(status.label)}
        </span>
      </div>
    </div>
  );
}
