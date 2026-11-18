"use client";

import { Crosshair } from "lucide-react";
import { STATUS_META, TARGET } from "@/lib/constants";
import type { KnowledgeGraph, MasteryRecord, TopicStatus } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const ORDER: TopicStatus[] = ["weak", "developing", "not_assessed", "mastered"];

/** The same map as a list: keyboard and screen-reader friendly, and easy on small screens. */
export function TopicListView({
  graph,
  mastery,
  focusId,
  changes,
  onFocus,
}: {
  graph: KnowledgeGraph;
  mastery: MasteryRecord[];
  focusId: string | null;
  changes: Record<string, { from: TopicStatus; to: TopicStatus }>;
  onFocus: (id: string) => void;
}) {
  const i18n = useLanguage();
  return (
    <div className="space-y-5 p-4">
      {ORDER.map((status) => {
        const items = graph.topics.filter((t) => (mastery.find((m) => m.topicId === t.id)?.status ?? "not_assessed") === status);
        if (!items.length) return null;
        return (
          <section key={status}>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[status].color }} aria-hidden="true" />
              {i18n.tx(STATUS_META[status].label)} <span className="font-mono text-xs text-muted">{items.length}</span>
            </h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {items.map((t) => {
                const rec = mastery.find((m) => m.topicId === t.id);
                const prereqs = graph.edges.filter((e) => e.to === t.id).length;
                const change = changes[t.id];
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => onFocus(t.id)}
                      aria-pressed={focusId === t.id}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                        focusId === t.id ? "border-text/60 bg-ink/[0.05]" : "border-line hover:border-line-strong",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          {i18n.tx(t.title)}
                          {t.id === graph.targetTopicId && <Crosshair size={13} style={{ color: TARGET.ink }} aria-label="current target" />}
                        </span>
                        <span className="block text-xs text-muted">
                          {i18n.tx(prereqs ? `${prereqs} prerequisite${prereqs > 1 ? "s" : ""}` : "Starting point")}
                          {i18n.tx(change && ` · was ${STATUS_META[change.from].label}`)}
                        </span>
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted">{i18n.tx(status === "not_assessed" ? "–" : `${rec?.score}%`)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
