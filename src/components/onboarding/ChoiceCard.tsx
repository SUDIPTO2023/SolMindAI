"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/** A selectable card used inside a radiogroup. Arrow keys are handled by the group. */
export function ChoiceCard({
  checked,
  onSelect,
  children,
  className,
  layoutGroup,
}: {
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
  layoutGroup: string;
}) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "relative w-full rounded-lg border p-5 text-left transition-colors",
        checked ? "border-purple/70 bg-purple/10" : "border-line bg-surface hover:border-line-strong",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border-2",
          checked ? "border-purple" : "border-line-strong",
        )}
      >
        {checked && <motion.span layoutId={layoutGroup} className="h-2.5 w-2.5 rounded-full bg-purple" />}
      </span>
      {children}
    </motion.button>
  );
}

/** Moves selection with arrow keys, as a native radio group would. */
export function radioKeys<T>(options: T[], current: T | null, select: (v: T) => void) {
  return (e: React.KeyboardEvent) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = current === null ? -1 : options.indexOf(current);
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = options[(i + step + options.length) % options.length];
    const group = e.currentTarget as HTMLElement; // read now: React clears currentTarget after the handler
    select(next);
    requestAnimationFrame(() => {
      group.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    });
  };
}
