"use client";

import { useReactFlow } from "@xyflow/react";
import { Focus, Maximize, Minus, Plus } from "lucide-react";
import { STATUS_META } from "@/lib/constants";
import type { TopicStatus } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

const ORDER: TopicStatus[] = ["mastered", "developing", "weak", "not_assessed"];

export function GraphToolbar({
  counts,
  hidden,
  onToggle,
  focusTitle,
  onClearFocus,
}: {
  counts: Record<TopicStatus, number>;
  hidden: Set<TopicStatus>;
  onToggle: (s: TopicStatus) => void;
  focusTitle: string | null;
  onClearFocus: () => void;
}) {
  const i18n = useLanguage();
  const flow = useReactFlow();
  const iconBtn = "grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-ink/[0.06] hover:text-text";
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={i18n.t("Filter topics by status")}>
        {ORDER.map((s) => {
          const on = !hidden.has(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(s)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                on ? "border-line-strong bg-ink/[0.04] text-text" : "border-line text-muted/60 line-through",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[s].color, opacity: on ? 1 : 0.4 }} aria-hidden="true" />
              {i18n.tx(STATUS_META[s].label)}
              <span className="font-mono tabular-nums text-muted">{counts[s]}</span>
            </button>
          );
        })}
      </div>
      <div className="ml-auto flex items-center gap-1">
        {focusTitle && (
          <button
            type="button"
            onClick={onClearFocus}
            className="mr-1 flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:text-text"
          >
            <Focus size={13} aria-hidden="true" />{" "}{i18n.t("Clear focus")}</button>
        )}
        <button type="button" className={iconBtn} onClick={() => flow.zoomOut({ duration: 250 })} aria-label={i18n.t("Zoom out")}><Minus size={16} /></button>
        <button type="button" className={iconBtn} onClick={() => flow.zoomIn({ duration: 250 })} aria-label={i18n.t("Zoom in")}><Plus size={16} /></button>
        <button type="button" className={iconBtn} onClick={() => flow.fitView({ duration: 500, padding: 0.12 })} aria-label={i18n.t("Fit the whole map")}><Maximize size={15} /></button>
      </div>
    </div>
  );
}
