"use client";

import { motion } from "motion/react";
import { History, Pause, Play } from "lucide-react";
import { STATUS_META } from "@/lib/constants";
import type { MasterySnapshot } from "@/lib/graph-rules";
import type { Topic, TopicStatus } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

/** Before and after: step through how the map changed across the session. */
export function ProgressTimeline({
  snapshots,
  index,
  onSelect,
  compare,
  onCompare,
  replaying,
  onReplay,
  changes,
  topics,
}: {
  snapshots: MasterySnapshot[];
  index: number;
  onSelect: (i: number) => void;
  compare: "previous" | "start";
  onCompare: (c: "previous" | "start") => void;
  replaying: boolean;
  onReplay: () => void;
  changes: Record<string, { from: TopicStatus; to: TopicStatus }>;
  topics: Topic[];
}) {
  const i18n = useLanguage();
  const last = snapshots.length - 1;
  const changed = Object.entries(changes);
  return (
    <section className="panel mb-4 p-4 sm:p-5" aria-label={i18n.t("Map history")}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <History size={16} className="text-accent" aria-hidden="true" />{" "}{i18n.t("How your map changed")}</h2>
        {snapshots.length > 1 && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div role="group" aria-label={i18n.t("Compare against")} className="flex rounded-md border border-line p-0.5 text-xs">
              {(["previous", "start"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={compare === c}
                  onClick={() => onCompare(c)}
                  className={cn("rounded px-2.5 py-1", compare === c ? "bg-elevated text-text" : "text-muted hover:text-text")}
                >
                  {i18n.tx(c === "previous" ? "Compare with previous step" : "Compare with start")}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onReplay}
              className="flex items-center gap-1.5 rounded-md bg-[image:var(--gradient-primary)] px-3 py-1.5 text-xs font-medium text-white"
            >
              {replaying ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
              {i18n.tx(replaying ? "Stop" : "Replay progress")}
            </button>
          </div>
        )}
      </div>

      {snapshots.length === 1 ? (
        <p className="mt-3 text-sm text-muted">{i18n.t("This is the starting map from the sample profile. Complete the diagnostic and the map records each change here, so you can compare before and after.")}</p>
      ) : (
        <>
          <ol className="relative mt-5 flex items-start gap-1 overflow-x-auto pb-1">
            <span aria-hidden="true" className="absolute left-4 right-4 top-[11px] h-px bg-line-strong" />
            {snapshots.map((s, i) => (
              <li key={s.id} className="relative min-w-[110px] flex-1">
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-current={i === index ? "step" : undefined}
                  className="group flex w-full flex-col items-center gap-2 px-1 text-center"
                >
                  <span className="relative grid h-[22px] w-[22px] place-items-center">
                    {i === index && (
                      <motion.span layoutId="timeline-dot" className="absolute inset-0 rounded-full bg-purple/30 ring-2 ring-purple" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                    <span className={cn("relative h-2.5 w-2.5 rounded-full", i <= index ? "bg-purple" : "bg-line-strong")} />
                  </span>
                  <span className={cn("text-xs leading-tight", i === index ? "font-medium text-text" : "text-muted group-hover:text-text")}>
                    {i18n.tx(s.label)}
                  </span>
                  {i === last && <span className="rounded-full bg-cyan/10 px-1.5 text-[10px] text-cyan-ink">{i18n.t("Now")}</span>}
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-3 border-t border-line pt-3 text-sm" aria-live="polite">
            {changed.length === 0 ? (
              <p className="text-muted">{i18n.tx(index === 0 ? "The starting point. Pick a later step to see what changed." : "No status changed at this step.")}</p>
            ) : (
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                {changed.map(([id, c]) => (
                  <li key={id} className="flex items-center gap-1.5">
                    <span className="font-medium">{i18n.tx(topics.find((t) => t.id === id)?.title)}</span>
                    <span style={{ color: STATUS_META[c.from].ink }}>{i18n.tx(STATUS_META[c.from].label)}</span>
                    <span className="text-muted">{i18n.t("to")}</span>
                    <span style={{ color: STATUS_META[c.to].ink }}>{i18n.tx(STATUS_META[c.to].label)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
