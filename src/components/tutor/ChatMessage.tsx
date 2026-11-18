"use client";

import { motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { Formula } from "@/components/ui/Formula";
import type { TutorMessage } from "@/types/tutoring";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

export function ChatMessage({ message }: { message: TutorMessage }) {
  const i18n = useLanguage();
  const student = message.role === "student";
  return (
    <motion.li
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex gap-3", student && "justify-end")}
    >
      {!student && (
        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-base" aria-hidden="true">
          <LogoMark size={18} />
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
          student && "rounded-br-md bg-[image:var(--gradient-primary)] text-white",
          !student && message.kind === "hint" && "rounded-bl-md border border-warning/35 bg-warning/[0.08]",
          !student && message.kind === "problem" && "rounded-bl-md border border-cyan/30 bg-cyan/[0.06]",
          !student && message.kind === "confirm" && "rounded-bl-md border border-success/30 bg-success/[0.06]",
          !student && !["hint", "problem", "confirm"].includes(message.kind ?? "") && "rounded-bl-md bg-elevated",
        )}
      >
        <span className="sr-only">{i18n.tx(student ? "You said: " : "Tutor: ")}</span>
        {message.kind === "hint" && (
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-warn-ink">
            <Lightbulb size={13} aria-hidden="true" />{" "}{i18n.t("Hint")}{" "}{message.hintLevel}{" "}{i18n.t("of 3")}</span>
        )}
        {message.kind === "problem" && <span className="mb-1 block text-xs font-semibold text-cyan-ink">{i18n.t("The problem")}</span>}
        {i18n.tx(message.text)}
        {message.tex && (
          <span className="mt-2 block overflow-x-auto rounded-md bg-base/50 px-3 py-2 text-text">
            <Formula tex={message.tex} />
          </span>
        )}
      </div>
    </motion.li>
  );
}

export function TypingIndicator() {
  const i18n = useLanguage();
  return (
    <li className="flex gap-3" aria-label={i18n.t("The tutor is replying")}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-base" aria-hidden="true">
        <LogoMark size={18} />
      </span>
      <div className="flex gap-1.5 rounded-2xl rounded-bl-md bg-elevated px-4 py-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-muted"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }}
          />
        ))}
      </div>
    </li>
  );
}
