"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CHAPTER_CONCEPTS, KNOWLEDGE_GRAPH, TOPICS } from "@/data/topics";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const { edges, targetTopicId } = KNOWLEDGE_GRAPH;

/** Every topic that must come before `id`, directly or indirectly. */
function prerequisitesOf(id: string, seen = new Set<string>()) {
  edges.filter((e) => e.to === id).forEach((e) => {
    if (!seen.has(e.from)) {
      seen.add(e.from);
      prerequisitesOf(e.from, seen);
    }
  });
  return seen;
}

export function ScopeSection() {
  const i18n = useLanguage();
  const [selected, setSelected] = useState(targetTopicId);
  const chain = useMemo(() => prerequisitesOf(selected), [selected]);
  const topic = TOPICS.find((t) => t.id === selected)!;
  const direct = edges.filter((e) => e.to === selected).map((e) => TOPICS.find((t) => t.id === e.from)!.title);
  const unlocks = edges.filter((e) => e.from === selected).map((e) => TOPICS.find((t) => t.id === e.to)!.title);
  const pos = (id: string) => TOPICS.find((t) => t.id === id)!.layout;

  return (
    <section id="scope" className="border-t border-line bg-base-2">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <SectionHeading
            kicker="Learning scope"
            title="Class 11 Physics, starting with Newton’s Laws of Motion"
            lead="One chapter, built properly. Choose a topic to see everything it depends on."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="panel relative h-[440px] p-4 sm:h-[480px]">
            <div className="relative h-full w-full">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
                {edges.map((e) => {
                  const a = pos(e.from);
                  const b = pos(e.to);
                  const lit = (chain.has(e.from) && (chain.has(e.to) || e.to === selected));
                  return (
                    <line
                      key={e.from + e.to}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      vectorEffect="non-scaling-stroke"
                      stroke={lit ? "#8B5CF6" : "rgb(148 163 184 / 0.22)"}
                      strokeWidth={lit ? 2 : 1.2}
                      style={{ transition: "stroke 0.3s" }}
                    />
                  );
                })}
              </svg>
              {TOPICS.map((t) => {
                const isSel = t.id === selected;
                const inChain = chain.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    aria-pressed={isSel}
                    aria-label={i18n.tx(t.title)}
                    style={{ left: `${t.layout.x}%`, top: `${t.layout.y}%` }}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-[13px]",
                      isSel
                        ? "border-cyan bg-cyan/15 text-cyan-ink"
                        : inChain
                          ? "border-purple/60 bg-purple/15 text-accent-softer"
                          : "border-line-strong bg-base text-muted hover:text-text",
                    )}
                  >
                    <span className="sm:hidden">{i18n.tx(t.shortTitle)}</span>
                    <span className="hidden sm:inline">{i18n.tx(t.title)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <motion.div key={selected} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-6" aria-live="polite">
              <p className="text-sm text-muted">{i18n.t("Selected topic")}</p>
              <h3 className="mt-1 text-2xl font-semibold">{i18n.tx(topic.title)}</h3>
              <p className="mt-2 text-muted">{i18n.tx(topic.summary)}</p>
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-muted">{i18n.t("Builds directly on")}</dt>
                  <dd>{direct.length ? direct.map((d) => i18n.tx(d)).join(", ") : i18n.tx("Nothing in this chapter. It is a starting point.")}</dd>
                </div>
                <div>
                  <dt className="text-muted">{i18n.t("Needed for")}</dt>
                  <dd>{unlocks.length ? unlocks.map((d) => i18n.tx(d)).join(", ") : i18n.tx("Nothing else in this map.")}</dd>
                </div>
                <div>
                  <dt className="text-muted">{i18n.t("All prerequisites")}</dt>
                  <dd>{i18n.t(chain.size === 1 ? "{n} topic" : "{n} topics", { n: chain.size })}</dd>
                </div>
              </dl>
            </motion.div>

            <div className="panel p-6">
              <p className="flex items-center gap-2 font-medium">
                <BookOpen size={17} className="text-accent" aria-hidden="true" />{i18n.t("Chapter scope:")}{" "}{CHAPTER_CONCEPTS.length}{" "}{i18n.t("concepts")}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {CHAPTER_CONCEPTS.map((c) => (
                  <li key={c} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                    {i18n.tx(c)}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted">{i18n.t("The demo map uses {used} of these. Prerequisite links are pending review by the team’s Physics content lead.", { used: TOPICS.length })}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
