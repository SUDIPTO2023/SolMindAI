"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { LoaderCircle, MessageCircleQuestion } from "lucide-react";
import type { FollowUpQuestion } from "@/types/assessment";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

export function FollowUpPanel({
  followUp,
  pending,
  error,
  onAnswer,
}: {
  followUp: FollowUpQuestion;
  pending: boolean;
  error: string | null;
  onAnswer: (optionId: string) => void;
}) {
  const i18n = useLanguage();
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <section className="panel p-6">
      <p className="flex items-center gap-2 text-sm font-medium text-accent">
        <MessageCircleQuestion size={16} aria-hidden="true" />{" "}{i18n.t("Follow-up question")}</p>
      <h2 className="mt-3 text-xl font-semibold leading-snug">{i18n.tx(followUp.prompt)}</h2>
      <p className="mt-1 text-sm text-muted">{i18n.t("There is no wrong choice here. Pick what is closest to what you did.")}</p>
      <div className="mt-5 grid gap-2" role="group" aria-label={i18n.t("Follow-up answers")}>
        {followUp.options.map((o, i) => (
          <motion.button
            key={o.id}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            disabled={pending}
            onClick={() => {
              setPicked(o.id);
              onAnswer(o.id);
            }}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors",
              picked === o.id ? "border-purple/70 bg-purple/12" : "border-line bg-surface hover:border-purple/50",
              pending && picked !== o.id && "opacity-50",
            )}
          >
            {i18n.tx(o.label)}
            {pending && picked === o.id && <LoaderCircle size={16} className="shrink-0 animate-spin" aria-label="Working out the result" />}
          </motion.button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-bad-ink">{i18n.tx(error)}</p>}
    </section>
  );
}
