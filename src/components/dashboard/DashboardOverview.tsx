"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import { ArrowRight, ChartColumn, Check, ClipboardCheck, Crosshair, Info, MessagesSquare, Network, X, type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/analytics/AnimatedNumber";
import { ProgressSparkline } from "@/components/analytics/Charts";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { modeById, objectiveById } from "@/data/onboarding";
import { chapterMastery } from "@/lib/analytics-rules";
import { STATUS_META, TARGET } from "@/lib/constants";
import { diffMastery } from "@/lib/graph-rules";
import { useServiceData } from "@/lib/use-service-data";
import { learningService } from "@/services/service-provider";
import { useLearningStore, type LearningState } from "@/store/learning-store";
import type { TopicStatus } from "@/types/learning";
import { MiniKnowledgeMap } from "./MiniKnowledgeMap";
import { useLanguage } from "@/i18n/use-language";

const loadGraph = learningService.getKnowledgeGraph;
const TONE = { info: "bg-neutral", success: "bg-success", warning: "bg-warning", error: "bg-error" } as const;

/** The one most useful next step, worked out from where the learner is in the journey. */
function nextStep(s: LearningState) {
  const mode = modeById(s.learningMode);
  if (!s.onboardingComplete || !mode)
    return { title: "Set up your learning plan", body: "Choose a learning mode and a goal, so SOLMIND knows where to begin.", href: "/onboarding", cta: "Choose a learning mode" };
  if (s.practice.done)
    return { title: "See how your knowledge map changed", body: "Your practice answers updated the topics you worked on. Replay the change on the map.", href: "/knowledge-map", cta: "View Knowledge Map", secondary: { href: "/analytics", cta: "Open Analytics" } };
  if (s.tutor.done)
    return { title: "Try a new practice question", body: "The guided session is done. A new question checks the idea on its own and adapts to your answer.", href: "/tutor", cta: "Continue to practice" };
  if (s.assessment.phase === "complete")
    return { title: "Work on what the diagnostic found", body: s.assessment.result?.nextAction ?? "", href: "/tutor", cta: "Learn with SOLMIND AI", secondary: { href: "/knowledge-map", cta: "View Knowledge Map" } };
  return {
    title: s.assessment.phase === "readiness" ? "Start your diagnostic" : "Continue your diagnostic",
    body: mode.firstStep,
    href: "/assessment/diagnostic",
    cta: s.assessment.phase === "readiness" ? "Start Diagnostic" : "Continue Diagnostic",
  };
}

const QUICK: { href: string; label: string; body: string; icon: LucideIcon }[] = [
  { href: "/assessment/diagnostic", label: "Diagnostic", body: "Find the gap behind an answer", icon: ClipboardCheck },
  { href: "/tutor", label: "AI Tutor", body: "Guided questions and practice", icon: MessagesSquare },
  { href: "/knowledge-map", label: "Knowledge Map", body: "Prerequisites and progress", icon: Network },
  { href: "/analytics", label: "Analytics", body: "What the answers show", icon: ChartColumn },
];

/** Page 03: the student dashboard. Every value comes from the shared learning record. */
export function DashboardOverview() {
  const i18n = useLanguage();
  const s = useLearningStore();
  const graph = useServiceData(loadGraph);
  const step = nextStep(s);
  const mode = modeById(s.learningMode);
  const goal = objectiveById(s.objective);
  const first = s.profile.name.split(" ")[0];

  const changed = useMemo(() => new Set(Object.keys(diffMastery(s.masteryHistory[0]?.mastery ?? null, s.mastery))), [s.masteryHistory, s.mastery]);
  const progress = s.masteryHistory.map((h) => ({ label: h.label, chapter: chapterMastery(h.mastery), netForce: null }));
  const counts = (Object.keys(STATUS_META) as TopicStatus[]).map((st) => ({ status: st, count: s.mastery.filter((m) => m.status === st).length }));
  const sessionAttempts = s.attempts;
  const correct = sessionAttempts.filter((a) => a.correct).length;
  const targetId = graph.data?.targetTopicId ?? "second-law";
  const target = graph.data?.topics.find((t) => t.id === targetId);
  const targetStatus = s.mastery.find((m) => m.topicId === targetId)?.status ?? "not_assessed";
  const targetPrereqs = graph.data?.edges.filter((e) => e.to === targetId).map((e) => e.from) ?? [];

  const kpis = [
    { label: "Chapter mastery", value: chapterMastery(s.mastery), suffix: "%", note: "All 11 topics, unassessed as 0" },
    { label: "Developing or better", value: s.mastery.filter((m) => m.status === "developing" || m.status === "mastered").length, suffix: ` / ${s.mastery.length}`, note: "Topics" },
    { label: "Answers this session", value: sessionAttempts.length, suffix: "", note: sessionAttempts.length ? `${correct} correct` : "None yet" },
    { label: "Gaps verified", value: s.gapEvidence.filter((g) => g.status === "verified" && g.gapType !== "none").length, suffix: "", note: "Confirmed with evidence" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${first}`}
        description={
          mode
            ? `${mode.title} mode${goal ? `. Goal: ${goal.title}` : ""}.`
            : "Your learning overview. Everything here comes from the same record the other pages use."
        }
        actions={mode ? <Link href="/onboarding" className="text-sm text-accent hover:underline">{i18n.t("Change plan")}</Link> : undefined}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel bg-grid relative overflow-hidden p-6 lg:col-span-2">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--c-glow-c), transparent)" }} />
          <p className="relative text-sm font-medium text-accent">{i18n.t("Continue learning")}</p>
          <h2 className="relative mt-2 text-2xl font-semibold">{i18n.tx(step.title)}</h2>
          <p className="relative mt-2 max-w-xl text-muted">{i18n.tx(step.body)}</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <ButtonLink href={step.href} size="lg">{i18n.tx(step.cta)} <ArrowRight size={16} aria-hidden="true" /></ButtonLink>
            {step.secondary && <ButtonLink href={step.secondary.href} size="lg" variant="secondary">{i18n.tx(step.secondary.cta)}</ButtonLink>}
          </div>
        </motion.section>

        <section className="panel p-6">
          <p className="flex items-center gap-1.5 text-sm" style={{ color: TARGET.ink }}><Crosshair size={14} aria-hidden="true" />{" "}{i18n.t("Current learning target")}</p>
          <h2 className="mt-1 text-xl font-semibold">{i18n.tx(target?.title ?? "Newton’s Second Law")}</h2>
          <p className="mt-1 text-sm text-muted">{i18n.tx(target?.summary)}</p>
          <div className="mt-3"><StatusPill status={targetStatus} /></div>
          {targetPrereqs.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
              {targetPrereqs.map((id) => (
                <li key={id} className="flex items-center justify-between gap-2">
                  <span className="text-muted">{i18n.tx(graph.data?.topics.find((t) => t.id === id)?.title)}</span>
                  <StatusPill status={s.mastery.find((m) => m.topicId === id)?.status ?? "not_assessed"} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <section key={k.label} className="panel p-5">
            <p className="text-sm text-muted">{i18n.tx(k.label)}</p>
            <p className="mt-2 text-3xl font-semibold"><AnimatedNumber value={k.value} suffix={k.suffix} /></p>
            <p className="mt-1 text-xs text-muted">{i18n.tx(k.note)}</p>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{i18n.t("Knowledge map")}</h2>
            <Link href="/knowledge-map" className="text-sm text-accent hover:underline">{i18n.t("Open the full map")}</Link>
          </div>
          {graph.data ? (
            <div className="mt-2"><MiniKnowledgeMap graph={graph.data} mastery={s.mastery} changed={changed} /></div>
          ) : (
            <div className="mt-4 h-56 animate-pulse rounded-md bg-ink/[0.04]" />
          )}
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            {counts.map(({ status, count }) => (
              <li key={status} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[status].color }} aria-hidden="true" />
                {i18n.tx(STATUS_META[status].label)} <span className="font-mono text-text">{count}</span>
              </li>
            ))}
            {changed.size > 0 && <li className="text-text">{i18n.t("Pulsing rings: changed since the start")}</li>}
          </ul>
        </section>

        <section className="panel flex flex-col p-6">
          <h2 className="font-semibold">{i18n.t("Learning progress")}</h2>
          <p className="mt-1 text-sm text-muted">{i18n.t("Chapter mastery at each step that changed the record.")}</p>
          <div className="mt-3 flex-1">
            {progress.length > 1 ? (
              <ProgressSparkline data={progress} />
            ) : (
              <p className="grid h-full min-h-[120px] place-items-center rounded-md border border-dashed border-line px-4 text-center text-sm text-muted">{i18n.t("The line starts after your first verified result.")}</p>
            )}
          </div>
          <Link href="/analytics" className="mt-3 text-sm text-accent hover:underline">{i18n.t("See all analytics")}</Link>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="font-semibold">{i18n.t("Recent assessment activity")}</h2>
          {sessionAttempts.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{i18n.t("No answers yet. The diagnostic is the first step.")}</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {[...sessionAttempts].reverse().slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center gap-3 text-sm">
                  <span className={a.correct ? "grid h-6 w-6 place-items-center rounded-full bg-success/15 text-ok-ink" : "grid h-6 w-6 place-items-center rounded-full bg-error/15 text-bad-ink"}>
                    {a.correct ? <Check size={13} aria-label="correct" /> : <X size={13} aria-label="incorrect" />}
                  </span>
                  <span className="flex-1">{i18n.tx(a.label)}</span>
                  <Badge>{i18n.tx(a.difficulty)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel p-6">
          <h2 className="font-semibold">{i18n.t("Recent activity")}</h2>
          <ul className="mt-4 space-y-2.5">
            {s.events.slice(0, 6).map((e) => (
              <li key={e.id} className="flex gap-3 text-sm">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE[e.tone]}`} aria-hidden="true" />
                <span>{i18n.tx(e.message)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <nav aria-label={i18n.t("Quick navigation")} className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="panel group flex items-start gap-3 p-5 transition-colors hover:border-purple/40">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-purple/12 text-accent-soft"><q.icon size={18} aria-hidden="true" /></span>
            <span>
              <span className="flex items-center gap-1 font-medium">{i18n.tx(q.label)} <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" /></span>
              <span className="mt-0.5 block text-xs text-muted">{i18n.tx(q.body)}</span>
            </span>
          </Link>
        ))}
      </nav>

      <p className="mt-6 flex items-start gap-2 text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{i18n.t("Starting mastery values belong to a fictional sample learner. They are illustrative, not measured results.")}</p>
    </>
  );
}
