"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Lightbulb, RotateCcw, Send, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { CurriculumNote } from "@/types/tutoring";
import { useLearningStore } from "@/store/learning-store";
import { cn } from "@/lib/utils";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { useLanguage } from "@/i18n/use-language";

const STEPS = 5;

export function ChatPanel({
  note,
  topicTitle,
  showBasicsPrompt,
  onOpenBasics,
  onStartPractice,
  outdated,
}: {
  note: CurriculumNote | undefined;
  topicTitle: string;
  showBasicsPrompt: boolean;
  onOpenBasics: () => void;
  onStartPractice: () => void;
  outdated: boolean;
}) {
  const i18n = useLanguage();
  const tutor = useLearningStore((s) => s.tutor);
  const send = useLearningStore((s) => s.sendTutorMessage);
  const hint = useLearningStore((s) => s.requestTutorHint);
  const restart = useLearningStore((s) => s.initTutorSession);
  const [text, setText] = useState("");
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [tutor.messages.length, tutor.typing, tutor.done]);

  const submit = (value: string, chipKind?: "correct" | "wrong" | "help") => {
    if (!value.trim()) return;
    void send(value, chipKind);
    setText("");
  };

  return (
    <section className="panel flex h-[680px] flex-col overflow-hidden" aria-label={i18n.t("Guided chat")}>
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
        <Badge tone="purple">{i18n.t("Guided mode")}</Badge>
        <Badge>{i18n.t("Topic:")}{" "}{i18n.tx(topicTitle)}</Badge>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted">{i18n.t("Step")}{" "}{tutor.done ? STEPS : tutor.step + 1}{" "}{i18n.t("of")}{" "}{STEPS}</span>
          <button
            type="button"
            onClick={() => void restart({ restart: true })}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:bg-ink/[0.05] hover:text-text"
          >
            <RotateCcw size={13} aria-hidden="true" />{" "}{i18n.t("Restart")}</button>
        </span>
      </header>

      <div ref={list} className="flex-1 overflow-y-auto px-5 py-5">
        {outdated && (
          <p className="mb-4 rounded-md border border-cyan/30 bg-cyan/[0.06] px-3 py-2 text-sm">{i18n.t("Your latest diagnostic found something new.")}{" "}
            <button type="button" className="font-medium text-cyan-ink hover:underline" onClick={() => void restart({ restart: true })}>{i18n.t("Restart the session to match it")}</button>
          </p>
        )}
        {showBasicsPrompt && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-success/30 bg-success/[0.06] px-4 py-3">
            <p className="flex items-center gap-2 text-sm">
              <Sprout size={16} className="text-ok-ink" aria-hidden="true" />{i18n.t("Starting from zero? A short lesson on net force comes first.")}</p>
            <Button size="md" variant="secondary" onClick={onOpenBasics}>{i18n.t("Explain from Basics")}</Button>
          </div>
        )}
        <ol className="space-y-4" aria-live="polite" aria-relevant="additions">
          {tutor.messages.map((m) => <ChatMessage key={m.id} message={m} />)}
          {tutor.typing && <TypingIndicator />}
        </ol>

        {tutor.done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 rounded-lg border border-line bg-base/60 p-5"
          >
            <Badge tone="success">{i18n.t("Guided session complete")}</Badge>
            {note && (
              <>
                <p className="mt-4 flex items-center gap-2 font-semibold">
                  <BookOpen size={16} className="text-accent" aria-hidden="true" /> {i18n.tx(note.title)}
                </p>
                <p className="mt-1.5 text-sm text-muted">{i18n.tx(note.body)}</p>
                <p className="mt-2 text-xs text-muted">{i18n.t("Source:")}{" "}{i18n.tx(note.source)}</p>
              </>
            )}
            <Button size="lg" className="mt-5" onClick={onStartPractice}>{i18n.t("Try a new question")}</Button>
          </motion.div>
        )}
        {tutor.error && <p role="alert" className="mt-4 text-sm text-bad-ink">{i18n.tx(tutor.error)}</p>}
      </div>

      {!tutor.done && (
        <div className="border-t border-line px-5 py-4">
          <div className="mb-3 flex flex-wrap gap-2" aria-label={i18n.t("Suggested replies")}>
            {tutor.chips.map((c) => (
              <motion.button
                key={c.label}
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={tutor.typing}
                onClick={() => submit(c.label, c.kind)}
                className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm transition-colors hover:border-purple/60 hover:bg-purple/10 disabled:opacity-40"
              >
                {i18n.tx(c.label)}
              </motion.button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(text);
            }}
          >
            <label htmlFor="tutor-reply" className="sr-only">{i18n.t("Your reply")}</label>
            <input
              id="tutor-reply"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={i18n.t("Type your answer, or choose a reply above")}
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-base px-3 text-text focus:border-purple focus:outline-none"
            />
            <Button type="submit" disabled={tutor.typing || !text.trim()} aria-label="Send">
              <Send size={16} aria-hidden="true" />
              <span className="hidden sm:inline">{i18n.t("Send")}</span>
            </Button>
            <button
              type="button"
              onClick={() => void hint()}
              disabled={tutor.typing || tutor.hintLevel >= 3}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-1.5 self-center rounded-md border px-3 text-sm transition-colors disabled:opacity-40",
                "border-warning/40 text-warn-ink hover:bg-warning/10",
              )}
            >
              <Lightbulb size={15} aria-hidden="true" />{" "}{i18n.t("Hint")}{" "}{tutor.hintLevel}/3
            </button>
          </form>
          <p className="mt-2 text-xs text-muted">{i18n.t("Scripted demo tutor. Replies follow fixed rules; no AI model is called.")}</p>
        </div>
      )}
    </section>
  );
}
