"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Crosshair, MousePointerClick, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { STATUS_META, TARGET } from "@/lib/constants";
import {
  confidenceFor,
  statusHistory,
  suggestedPath,
  topicEvidence,
  type MasterySnapshot,
} from "@/lib/graph-rules";
import type { GapEvidence, QuestionAttempt } from "@/types/assessment";
import type { KnowledgeGraph, MasteryRecord, TopicStatus } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const GAP_TEXT: Record<string, string> = {
  conceptual: "Conceptual gap verified",
  mixed: "Mixed gap verified",
  mathematical: "Calculation slip verified",
};

interface Props {
  graph: KnowledgeGraph;
  focusId: string | null;
  mastery: MasteryRecord[];
  attempts: QuestionAttempt[];
  gaps: GapEvidence[];
  snapshots: MasterySnapshot[];
  historic: boolean;
  onFocus: (id: string) => void;
}

function TopicChip({ id, graph, mastery, onFocus }: { id: string; graph: KnowledgeGraph; mastery: MasteryRecord[]; onFocus: (id: string) => void }) {
  const i18n = useLanguage();
  const t = graph.topics.find((x) => x.id === id)!;
  const status = mastery.find((m) => m.topicId === id)?.status ?? "not_assessed";
  return (
    <button
      type="button"
      onClick={() => onFocus(id)}
      className="flex items-center gap-1.5 rounded-full border border-line bg-ink/[0.02] px-2.5 py-1 text-xs hover:border-line-strong"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_META[status].color }} aria-hidden="true" />
      {i18n.tx(t.title)}
      <span className="sr-only">, {i18n.tx(STATUS_META[status].label)}</span>
    </button>
  );
}

export function TopicDetailPanel(props: Props) {
  const i18n = useLanguage();
  const { graph, focusId, mastery } = props;
  return (
    <aside className="panel h-full p-5" aria-live="polite" aria-label={i18n.t("Topic details")}>
      {focusId ? <TopicDetails {...props} focusId={focusId} /> : <Overview graph={graph} mastery={mastery} onFocus={props.onFocus} />}
    </aside>
  );
}

function TopicDetails({ graph, focusId, mastery, attempts, gaps, snapshots, historic, onFocus }: Props & { focusId: string }) {
  const i18n = useLanguage();
  const topic = graph.topics.find((t) => t.id === focusId)!;
  const record = mastery.find((m) => m.topicId === focusId);
  const status: TopicStatus = record?.status ?? "not_assessed";
  const evidence = topicEvidence(focusId, attempts, gaps);
  const confidence = confidenceFor(evidence.count);
  const history = statusHistory(focusId, snapshots);
  const prereqs = graph.edges.filter((e) => e.to === focusId).map((e) => e.from);
  const unlocks = graph.edges.filter((e) => e.from === focusId).map((e) => e.to);
  const isTarget = focusId === graph.targetTopicId;
  const fromSample = evidence.count === 0 && status !== "not_assessed";

  return (
    <motion.div key={focusId} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={status} />
        {isTarget && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ color: TARGET.ink, background: `${TARGET.color}1a` }}>
            <Crosshair size={12} aria-hidden="true" />{" "}{i18n.t("Current target")}</span>
        )}
        {historic && <Badge>{i18n.t("Past view")}</Badge>}
      </div>
      <h2 className="mt-3 text-xl font-semibold">{i18n.tx(topic.title)}</h2>
      <p className="mt-1 text-sm text-muted">{i18n.tx(topic.summary)}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-line bg-base/50 p-3">
          <p className="text-xs text-muted">{i18n.t("Mastery estimate")}</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{i18n.tx(status === "not_assessed" ? "–" : `${record?.score ?? 0}%`)}</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/[0.07]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: STATUS_META[status].color }}
              initial={{ width: 0 }}
              animate={{ width: `${status === "not_assessed" ? 0 : record?.score ?? 0}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
        <div className="rounded-md border border-line bg-base/50 p-3">
          <p className="text-xs text-muted">{i18n.t("Confidence")}</p>
          <p className="mt-1 text-sm font-medium">{i18n.tx(confidence.label)}</p>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= confidence.level ? "bg-cyan" : "bg-ink/[0.08]")} />
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted">{i18n.t(evidence.count === 1 ? "{n} piece of evidence" : "{n} pieces of evidence", { n: evidence.count })}</p>
        </div>
      </div>
      {fromSample && <p className="mt-2 text-xs text-muted">{i18n.t("This status comes from the sample profile, not from answers in this session.")}</p>}

      {history.length > 1 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium text-muted">{i18n.t("Status over time")}</h3>
          <ol className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            {history.map((h, i) => (
              <li key={`${h.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ArrowRight size={12} className="text-muted" aria-hidden="true" />}
                <span className="rounded-md border border-line px-2 py-1">
                  <span className="text-muted">{i18n.tx(h.label)}: </span>
                  <span style={{ color: STATUS_META[h.status].ink }}>{i18n.tx(STATUS_META[h.status].label)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-xs font-medium text-muted">{i18n.t("Evidence summary")}</h3>
        {evidence.count === 0 ? (
          <p className="mt-1.5 text-sm text-muted">{i18n.t("No answers in this session touch this topic yet.")}</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {evidence.findings.map((g) => (
              <li key={g.id} className="flex items-start gap-2">
                <span className="mt-0.5 rounded bg-error/15 px-1.5 text-[11px] font-medium text-bad-ink">{i18n.t("Diagnosis")}</span>
                {i18n.tx(GAP_TEXT[g.gapType] ?? "Finding verified")} ({i18n.tx(g.confidence)}{" "}{i18n.t("confidence)")}</li>
            ))}
            {evidence.attempts.slice(-5).map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <span className={cn("grid h-5 w-5 place-items-center rounded-full", a.correct ? "bg-success/15 text-ok-ink" : "bg-error/15 text-bad-ink")}>
                  {a.correct ? <Check size={12} aria-label="correct" /> : <X size={12} aria-label="incorrect" />}
                </span>
                <span>{i18n.tx(a.label)}</span>
                <span className="ml-auto text-xs text-muted">{i18n.tx(a.difficulty)}, {i18n.tx(a.bloom)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <h3 className="text-xs font-medium text-muted">{i18n.t("Builds on")}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {prereqs.length ? prereqs.map((id) => <TopicChip key={id} id={id} graph={graph} mastery={mastery} onFocus={onFocus} />) : <span className="text-sm text-muted">{i18n.t("A starting point in this chapter.")}</span>}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-medium text-muted">{i18n.t("Needed for")}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {unlocks.length ? unlocks.map((id) => <TopicChip key={id} id={id} graph={graph} mastery={mastery} onFocus={onFocus} />) : <span className="text-sm text-muted">{i18n.t("Nothing else in this map.")}</span>}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        {status === "weak" && <Link href="/tutor" className={buttonClass({ className: "w-full" })}>{i18n.t("Work on it with the tutor")}</Link>}
        {status === "developing" && <Link href="/tutor" className={buttonClass({ variant: "secondary", className: "w-full" })}>{i18n.t("Keep practising")}</Link>}
        {status === "not_assessed" && (
          <Link href="/assessment/diagnostic" className={buttonClass({ variant: "secondary", className: "w-full" })}>{i18n.t("Check it in the diagnostic")}</Link>
        )}
        <p className="mt-3 text-xs text-muted">{i18n.t("One correct answer never marks a topic Mastered. It takes repeated, independent evidence.")}</p>
      </div>
    </motion.div>
  );
}

function Overview({ graph, mastery, onFocus }: { graph: KnowledgeGraph; mastery: MasteryRecord[]; onFocus: (id: string) => void }) {
  const i18n = useLanguage();
  const target = graph.topics.find((t) => t.id === graph.targetTopicId)!;
  const path = suggestedPath(graph.targetTopicId, graph.topics, graph.edges, mastery);
  const prereqCount = graph.edges.filter((e) => e.to === target.id).length;
  const ready = graph.edges
    .filter((e) => e.to === target.id)
    .filter((e) => ["developing", "mastered"].includes(mastery.find((m) => m.topicId === e.from)?.status ?? "")).length;

  return (
    <div>
      <p className="flex items-center gap-2 text-xs text-muted">
        <MousePointerClick size={14} aria-hidden="true" />{" "}{i18n.t("Select any topic to see its evidence")}</p>
      <h2 className="mt-3 text-xl font-semibold">{i18n.t("Newton’s Laws of Motion")}</h2>
      <p className="mt-1 text-sm text-muted">{i18n.t("11 topics and the prerequisite links between them. Arrows point from a foundation to what builds on it.")}</p>

      <div className="mt-5 rounded-md border border-line bg-base/50 p-4">
        <p className="flex items-center gap-1.5 text-xs" style={{ color: TARGET.ink }}>
          <Crosshair size={13} aria-hidden="true" />{" "}{i18n.t("Current target")}</p>
        <button type="button" onClick={() => onFocus(target.id)} className="mt-1 text-left text-lg font-semibold hover:underline">
          {i18n.tx(target.title)}
        </button>
        <p className="mt-1 text-sm text-muted">
          {ready}{" "}{i18n.t("of")}{" "}{prereqCount}{" "}{i18n.t("direct prerequisites are Developing or better.")}</p>
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-medium text-muted">{i18n.t("Suggested learning path")}</h3>
        {path.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{i18n.t("Every topic on the way to the target is Developing or better.")}</p>
        ) : (
          <ol className="mt-2 space-y-1.5">
            {path.map((id, i) => {
              const t = graph.topics.find((x) => x.id === id)!;
              const status = mastery.find((m) => m.topicId === id)?.status ?? "not_assessed";
              return (
                <li key={id}>
                  <button type="button" onClick={() => onFocus(id)} className="flex w-full items-center gap-3 rounded-md border border-line px-3 py-2 text-left text-sm hover:border-line-strong">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-ink/[0.06] font-mono text-[11px]">{i + 1}</span>
                    <span className="flex-1">{i18n.tx(t.title)}</span>
                    <StatusPill status={status} />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-5 rounded-md border border-line p-3 text-xs text-muted">
        <p className="flex items-center gap-2"><span className="h-0.5 w-5 rounded bg-purple" aria-hidden="true" />{" "}{i18n.t("Prerequisites of the selected topic")}</p>
        <p className="mt-1.5 flex items-center gap-2"><span className="h-0.5 w-5 rounded bg-cyan" aria-hidden="true" />{" "}{i18n.t("Topics that build on it")}</p>
      </div>
    </div>
  );
}
