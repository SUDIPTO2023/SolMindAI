"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MessagesSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useServiceData } from "@/lib/use-service-data";
import { learningService } from "@/services/service-provider";
import { useLearningStore } from "@/store/learning-store";
import { cn } from "@/lib/utils";
import { AdaptivePractice } from "./AdaptivePractice";
import { ChatPanel } from "./ChatPanel";
import { ContextPanel } from "./ContextPanel";
import { FoundationLessonDialog } from "./FoundationLessonDialog";
import { useLanguage } from "@/i18n/use-language";

const loadContent = learningService.getTutorContent;

/** Page 05: AI Tutor workspace. */
export function TutorWorkspace() {
  const i18n = useLanguage();
  const content = useServiceData(loadContent);
  const s = useLearningStore();
  const [view, setView] = useState<"chat" | "practice">(s.practice.current || s.practice.done ? "practice" : "chat");
  const [lessonOpen, setLessonOpen] = useState(false);
  const initTutorSession = s.initTutorSession;

  // Start the guided session the first time the tutor is opened.
  useEffect(() => {
    void initTutorSession();
  }, [initTutorSession]);

  if (content.loading) {
    return (
      <div role="status" aria-label={i18n.t("Loading the tutor")} className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="h-[680px] animate-pulse rounded-lg bg-ink/[0.04]" />
        <div className="h-[680px] animate-pulse rounded-lg bg-ink/[0.03]" />
      </div>
    );
  }
  if (content.error || !content.data) {
    return (
      <EmptyState icon={MessagesSquare} title="The tutor could not load" body="Nothing was lost. Try loading it again.">
        <Button onClick={content.retry}><RefreshCw size={16} aria-hidden="true" />{" "}{i18n.t("Try again")}</Button>
      </EmptyState>
    );
  }

  const data = content.data;
  const gap = s.gapEvidence.at(-1) ?? null;
  const problem = data.questions.find((q) => q.id === (s.tutor.questionId ?? "Q001")) ?? data.questions[0];
  const topicId = gap?.recommendedTopicId ?? "net-force";
  const topicTitle = data.topics.find((t) => t.id === topicId)?.title ?? "Net Force";
  const showBasicsPrompt =
    !s.tutor.basicsDone && (s.learningMode === "learn_from_zero" || gap?.gapType === "insufficient_evidence");
  const outdated = !!gap && !!s.tutor.questionId && s.tutor.gapId !== gap.id;

  const openPractice = () => {
    void s.startPractice();
    setView("practice");
  };

  return (
    <>
      <PageHeader
        title="AI Tutor"
        description="The tutor asks before it tells. You reach the answer yourself, with hints when you want them."
        actions={
          <div role="tablist" aria-label={i18n.t("Tutor view")} className="flex rounded-lg border border-line bg-ink/[0.02] p-1">
            {(["chat", "practice"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className="relative rounded-md px-4 py-2 text-sm font-medium"
              >
                {view === v && <motion.span layoutId="tutor-view" className="absolute inset-0 rounded-md bg-elevated" />}
                <span className={cn("relative", view === v ? "text-text" : "text-muted")}>
                  {i18n.tx(v === "chat" ? "Guided chat" : "Adaptive practice")}
                </span>
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {view === "chat" ? (
            <ChatPanel
              note={data.notes.find((n) => n.topicId === "second-law")}
              topicTitle={topicTitle}
              showBasicsPrompt={showBasicsPrompt}
              onOpenBasics={() => setLessonOpen(true)}
              onStartPractice={openPractice}
              outdated={outdated}
            />
          ) : (
            <AdaptivePractice topics={data.topics} />
          )}
        </div>
        <ContextPanel
          content={data}
          problem={problem}
          topicId={topicId}
          gap={gap}
          mastery={s.mastery}
          tutor={s.tutor}
          practice={s.practice}
          onOpenBasics={() => setLessonOpen(true)}
        />
      </div>

      <FoundationLessonDialog
        open={lessonOpen}
        onClose={() => setLessonOpen(false)}
        lesson={data.lesson}
        prefs={s.preferences}
        done={s.tutor.basicsDone}
        onComplete={(correct) => s.completeBasics(data.lesson, correct)}
      />
    </>
  );
}
