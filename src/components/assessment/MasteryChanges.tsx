"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import type { MasteryRecord, Topic } from "@/types/learning";
import { useLanguage } from "@/i18n/use-language";

/** Topics whose status changed because of this assessment. */
export function MasteryChanges({
  before,
  after,
  topics,
}: {
  before: MasteryRecord[];
  after: MasteryRecord[];
  topics: Topic[];
}) {
  const i18n = useLanguage();
  const changed = after.filter((a) => {
    const b = before.find((x) => x.topicId === a.topicId);
    return b && (b.status !== a.status || b.score !== a.score);
  });
  return (
    <section className="panel p-6">
      <h2 className="font-semibold">{i18n.t("What changed on your knowledge map")}</h2>
      {changed.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{i18n.t("No topic changed. Without verified evidence, SOLMIND does not mark anything up or down.")}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {changed.map((a, i) => {
            const b = before.find((x) => x.topicId === a.topicId)!;
            return (
              <motion.li
                key={a.topicId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span className="w-40 font-medium">{i18n.tx(topics.find((t) => t.id === a.topicId)?.title ?? a.topicId)}</span>
                <StatusPill status={b.status} />
                <ArrowRight size={14} className="text-muted" aria-label="changed to" />
                <StatusPill status={a.status} />
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
