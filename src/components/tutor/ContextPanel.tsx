"use client";

import Link from "next/link";
import { BookOpen, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Formula } from "@/components/ui/Formula";
import { StatusPill } from "@/components/ui/StatusPill";
import type { TutorContent } from "@/services/learning-service";
import type { ForceProblem, GapEvidence } from "@/types/assessment";
import type { MasteryRecord } from "@/types/learning";
import type { PracticeSession, TutorSession } from "@/store/learning-store";
import { ForceBuildDiagram } from "./ForceBuildDiagram";
import { useLanguage } from "@/i18n/use-language";

const GAP_TEXT = {
  conceptual: "Conceptual gap",
  mathematical: "Mathematical gap",
  mixed: "Mixed gap",
  none: "No gap found",
  insufficient_evidence: "Insufficient evidence",
} as const;

export function ContextPanel({
  content,
  problem,
  topicId,
  gap,
  mastery,
  tutor,
  practice,
  onOpenBasics,
}: {
  content: TutorContent;
  problem: ForceProblem;
  topicId: string;
  gap: GapEvidence | null;
  mastery: MasteryRecord[];
  tutor: TutorSession;
  practice: PracticeSession;
  onOpenBasics: () => void;
}) {
  const i18n = useLanguage();
  const topic = content.topics.find((t) => t.id === topicId);
  const statusOf = (id: string) => mastery.find((m) => m.topicId === id)?.status ?? "not_assessed";
  const prereqs = content.edges.filter((e) => e.to === topicId).map((e) => content.topics.find((t) => t.id === e.from)!);
  const misconception = content.misconceptions.find((m) => m.id === gap?.misconceptionId);
  const note = content.notes.find((n) => n.topicId === "second-law");
  const steps = tutor.done ? 5 : tutor.step;
  const progress = Math.round(((steps + Math.min(practice.results.length, 2)) / 7) * 100);

  return (
    <aside className="space-y-4" aria-label={i18n.t("Learning context")}>
      <section className="panel p-5">
        <p className="text-xs text-muted">{i18n.t("Current topic")}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{i18n.tx(topic?.title)}</h2>
          <StatusPill status={statusOf(topicId)} />
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs text-muted">{i18n.t("Identified learning gap")}</p>
          {gap ? (
            <>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge tone={gap.status === "verified" ? "error" : "cyan"}>{i18n.tx(GAP_TEXT[gap.gapType])}</Badge>
                <Badge>{i18n.tx(gap.status === "verified" ? "Verified" : gap.status === "suspected" ? "Suspected" : gap.status === "uncertain" ? "Uncertain" : "Nothing to confirm")}</Badge>
              </div>
              {misconception && <p className="mt-2 text-sm text-muted">{i18n.tx(misconception.statement)}</p>}
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">{i18n.t("No diagnostic yet.")}{" "}<Link href="/assessment/diagnostic" className="text-accent hover:underline">{i18n.t("Take it first")}</Link>{" "}{i18n.t("for a session built around your answer.")}</p>
          )}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold">{i18n.t("The object, as you describe it")}</h2>
        <div className="bg-grid mt-3 rounded-md border border-line p-2">
          <ForceBuildDiagram problem={problem} friction={tutor.done || tutor.step >= 1} net={tutor.done || tutor.step >= 3} />
        </div>
        <p className="mt-2 text-xs text-muted">{i18n.t("Each force appears once you name it in the chat.")}</p>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold">{i18n.t("Builds on")}</h2>
        <ul className="mt-3 space-y-2">
          {prereqs.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{i18n.tx(p.title)}</span>
              <StatusPill status={statusOf(p.id)} />
            </li>
          ))}
          {prereqs.length === 0 && <li className="text-sm text-muted">{i18n.t("No prerequisites in this chapter.")}</li>}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold">{i18n.t("Important formula")}</h2>
        <div className="mt-3 space-y-2 overflow-x-auto rounded-md border border-line bg-base/60 px-3 py-3">
          <Formula tex={String.raw`a = \dfrac{F_{\text{net}}}{m}`} display />
          <Formula tex={String.raw`F_{\text{net}} = F_{\text{applied}} - f`} display />
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{i18n.t("Learning progress")}</h2>
          <span className="text-xs text-muted tabular-nums">{progress}%</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
          <div className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">{i18n.t("Guided steps")}</dt><dd className="tabular-nums">{steps}{" "}{i18n.t("of 5")}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{i18n.t("Hints used")}</dt><dd className="tabular-nums">{tutor.hintsUsed}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{i18n.t("Practice answered")}</dt><dd className="tabular-nums">{practice.results.length}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{i18n.t("Foundation lesson")}</dt><dd>{i18n.tx(tutor.basicsDone ? "Done" : "Not yet")}</dd></div>
        </dl>
      </section>

      <section className="panel p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Sprout size={15} className="text-ok-ink" aria-hidden="true" />{" "}{i18n.t("Need to start further back?")}</h2>
        <p className="mt-1.5 text-sm text-muted">{i18n.t("A short lesson on net force: definition, everyday example, formula and one quick check.")}</p>
        <Button variant="secondary" className="mt-3 w-full" onClick={onOpenBasics}>{i18n.t("Explain from Basics")}</Button>
      </section>

      {note && (
        <section className="panel p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><BookOpen size={15} className="text-accent" aria-hidden="true" />{" "}{i18n.t("Curriculum reference")}</h2>
          <p className="mt-2 text-sm font-medium">{i18n.tx(note.title)}</p>
          <p className="mt-1 text-sm text-muted">{i18n.tx(note.body)}</p>
          <p className="mt-2 text-xs text-muted">{i18n.tx(note.source)}{" "}{i18n.t("Local verified content, not live retrieval.")}</p>
        </section>
      )}
    </aside>
  );
}
