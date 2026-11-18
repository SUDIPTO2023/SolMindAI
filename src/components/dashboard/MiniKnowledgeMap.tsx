"use client";

import { motion } from "motion/react";
import { STATUS_META, TARGET } from "@/lib/constants";
import type { KnowledgeGraph, MasteryRecord, TopicStatus } from "@/types/learning";
import { useLanguage } from "@/i18n/use-language";

/** A small, read-only picture of the knowledge map. Rings mark topics that changed since the start. */
export function MiniKnowledgeMap({
  graph,
  mastery,
  changed,
}: {
  graph: KnowledgeGraph;
  mastery: MasteryRecord[];
  changed: Set<string>;
}) {
  const i18n = useLanguage();
  const pos = (id: string) => {
    const t = graph.topics.find((x) => x.id === id)!;
    return { x: 30 + t.layout.x * 5.4, y: 18 + t.layout.y * 2.55 };
  };
  const statusOf = (id: string): TopicStatus => mastery.find((m) => m.topicId === id)?.status ?? "not_assessed";
  return (
    <svg viewBox="0 0 600 290" className="w-full" role="img" aria-label={i18n.t("Preview of the knowledge map, coloured by topic status")}>
      {graph.edges.map((e) => {
        const a = pos(e.from);
        const b = pos(e.to);
        return <line key={e.from + e.to} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgb(148 163 184 / 0.25)" strokeWidth="1.5" />;
      })}
      {graph.topics.map((t, i) => {
        const p = pos(t.id);
        const color = STATUS_META[statusOf(t.id)].color;
        return (
          <g key={t.id}>
            {t.id === graph.targetTopicId && <circle cx={p.x} cy={p.y} r="17" fill="none" stroke={TARGET.color} strokeWidth="2" strokeDasharray="4 3" />}
            {changed.has(t.id) && (
              <motion.circle
                cx={p.x} cy={p.y} r="12" fill="none" stroke={color} strokeWidth="2"
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: [0.9, 0], scale: [1, 1.9] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              />
            )}
            <motion.circle
              cx={p.x} cy={p.y} r="9" fill={color}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px`, transition: "fill 0.6s" }}
            />
            <text x={p.x} y={p.y + (t.id === graph.targetTopicId ? 33 : 25)} textAnchor="middle" fill="var(--color-muted)" fontSize="12">{i18n.tx(t.shortTitle)}</text>
          </g>
        );
      })}
    </svg>
  );
}
