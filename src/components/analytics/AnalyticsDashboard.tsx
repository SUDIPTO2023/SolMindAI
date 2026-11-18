"use client";

import { useMemo, useState } from "react";
import { ChartColumn, Info, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { computeAnalytics } from "@/lib/analytics-rules";
import { useServiceData } from "@/lib/use-service-data";
import { learningService } from "@/services/service-provider";
import { useLearningStore } from "@/store/learning-store";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";
import { AssessmentHistory } from "./AssessmentHistory";
import { ChartCard } from "./ChartCard";
import { BloomChart, DifficultyChart, IndependenceChart, LayerChart, ProgressChart, TopicMasteryChart } from "./Charts";
import { useLanguage } from "@/i18n/use-language";

const loadContent = () =>
  Promise.all([learningService.getKnowledgeGraph(), learningService.getSampleHistory()]).then(([graph, sample]) => ({ graph, sample }));

const TONE = { info: "bg-neutral", success: "bg-success", warning: "bg-warning", error: "bg-error" } as const;

/** Page 07: learning analytics, all computed from the shared learning record. */
export function AnalyticsDashboard() {
  const i18n = useLanguage();
  const content = useServiceData(loadContent);
  const s = useLearningStore();
  const [includeSample, setIncludeSample] = useState(true);

  const analytics = useMemo(() => {
    if (!content.data) return null;
    return computeAnalytics({
      attempts: includeSample ? [...content.data.sample, ...s.attempts] : s.attempts,
      mastery: s.mastery,
      history: s.masteryHistory,
      gaps: s.gapEvidence,
      tutorHints: s.tutor.hintsUsed,
      events: s.events,
      topics: content.data.graph.topics,
    });
  }, [content.data, includeSample, s.attempts, s.mastery, s.masteryHistory, s.gapEvidence, s.tutor.hintsUsed, s.events]);

  if (content.loading) {
    return (
      <div role="status" aria-label={i18n.t("Loading analytics")} className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-ink/[0.04]" />)}
        <div className="h-96 animate-pulse rounded-lg bg-ink/[0.04] md:col-span-4" />
      </div>
    );
  }
  if (content.error || !content.data || !analytics) {
    return (
      <EmptyState icon={ChartColumn} title="Analytics could not load" body="Nothing was lost. Try loading it again.">
        <Button onClick={content.retry}><RefreshCw size={16} aria-hidden="true" />{" "}{i18n.t("Try again")}</Button>
      </EmptyState>
    );
  }

  const a = analytics;
  const noAnswers = a.overview.answered === 0;
  const kpis = [
    { label: "Chapter mastery", value: a.overview.chapterMastery, suffix: "%", note: "Across all 11 topics; unassessed counts as 0" },
    { label: "Topics Developing or better", value: a.overview.developingOrBetter, suffix: ` / ${a.overview.totalTopics}`, note: "None is Mastered from one answer" },
    { label: "Answer accuracy", value: a.overview.accuracy, suffix: "%", note: `${a.overview.answered} recorded answers` },
    { label: "Solved independently", value: a.overview.independentRate, suffix: "%", note: "Correct answers with no hints" },
  ];

  return (
    <>
      <PageHeader
        title="Learning Analytics"
        description="What the answers say about the learning. Every figure is calculated from the same record as the dashboard and knowledge map."
        actions={
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm">
            <span className="relative inline-flex h-5 w-9 shrink-0">
              <input type="checkbox" checked={includeSample} onChange={(e) => setIncludeSample(e.target.checked)} className="peer sr-only" />
              <span className="absolute inset-0 rounded-full bg-ink/10 transition-colors peer-checked:bg-purple peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-cyan" />
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
            </span>{i18n.t("Include sample history")}<Badge>{i18n.t("Illustrative")}</Badge>
          </label>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <section key={k.label} className="panel p-5">
            <p className="text-sm text-muted">{i18n.tx(k.label)}</p>
            <p className="mt-2 text-3xl font-semibold">
              {k.value === null ? <span className="text-xl text-muted">{i18n.t("No data")}</span> : <AnimatedNumber value={k.value} suffix={k.suffix} />}
            </p>
            <p className="mt-1 text-xs text-muted">{i18n.tx(k.note)}</p>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <ChartCard title="Topic-wise mastery" description="Current estimate for every topic, coloured by status." className="lg:col-span-3" delay={0.05}>
          <TopicMasteryChart data={a.topicMastery} />
        </ChartCard>
        <ChartCard
          title="Learning progress over time"
          description="Chapter mastery and Net Force at each step that changed the record."
          className="lg:col-span-2"
          empty={a.progress.length < 2}
          emptyText="Progress appears after the first verified result. Complete the diagnostic to start the line."
          delay={0.1}
        >
          <ProgressChart data={a.progress} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Conceptual vs mathematical" description="Accuracy for each layer of understanding." empty={noAnswers} emptyText="No answers recorded yet." delay={0.15}>
          <LayerChart data={a.layers} />
          <p className="mt-2 text-xs text-muted">{i18n.t("A correct problem counts for both layers. A wrong one counts against the layer its diagnosis found.")}</p>
        </ChartCard>
        <ChartCard title="Performance by difficulty" description="Correct and not-yet-correct answers per level." empty={noAnswers} emptyText="No answers recorded yet." delay={0.2}>
          <DifficultyChart data={a.difficulty} />
        </ChartCard>
        <ChartCard title="Bloom’s taxonomy" description="Accuracy at each thinking level." empty={noAnswers} emptyText="No answers recorded yet." delay={0.25}>
          <BloomChart data={a.bloom} />
          <p className="mt-2 text-xs text-muted">{i18n.t("Levels marked No data have no questions yet. They are not scored as zero.")}</p>
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Hints and independent solving" description="How answers were reached." empty={noAnswers} emptyText="No answers recorded yet." delay={0.3}>
          <IndependenceChart data={a.independence} />
          <ul className="mt-2 space-y-1.5 text-sm">
            {a.independence.slices.map((sl) => (
              <li key={sl.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: sl.color }} aria-hidden="true" />
                <span className="flex-1 text-muted">{i18n.tx(sl.name)}</span>
                <span className="font-mono tabular-nums">{sl.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-line pt-3 text-xs text-muted">{i18n.t("Hints in assessments:")}{" "}{a.independence.answerHints}{i18n.t(". Hints in the tutor chat:")}{" "}{a.independence.tutorHints}{i18n.t(". Hints are a learning signal, not a penalty.")}</p>
        </ChartCard>
        <ChartCard title="Learning activity" description="What happened in this session." className="lg:col-span-2" delay={0.35}>
          <div className="grid gap-5 sm:grid-cols-2">
            <ul className="space-y-2.5">
              {a.activity.byType.map((t) => (
                <li key={t.type} className="text-sm">
                  <div className="flex justify-between"><span className="text-muted">{i18n.tx(t.label)}</span><span className="font-mono tabular-nums">{t.count}</span></div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink/[0.06]">
                    <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${(t.count / a.activity.byType[0].count) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <ul className="space-y-2.5">
              {a.activity.recent.map((e) => (
                <li key={e.id} className="flex gap-2.5 text-sm">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", TONE[e.tone])} aria-hidden="true" />
                  {i18n.tx(e.message)}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-xs text-muted">{i18n.t("Gaps verified this session:")}{" "}{a.overview.gapsVerified}.</p>
        </ChartCard>
      </div>

      <div className="mt-4">
        <AssessmentHistory attempts={includeSample ? [...content.data.sample, ...s.attempts] : s.attempts} topics={content.data.graph.topics} />
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{i18n.t("Sample history belongs to a fictional learner and is illustrative. It is never counted as evidence on the knowledge map. Turn it off to see this session alone.")}</p>
    </>
  );
}
