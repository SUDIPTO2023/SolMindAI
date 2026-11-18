"use client";

import { STATUS_META, TARGET } from "@/lib/constants";
import type { TopicStatus } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

export function StatusDot({ color, ring = false }: { color: string; ring?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", ring && "ring-2 ring-offset-2 ring-offset-base")}
      style={ring ? { background: "transparent", boxShadow: `inset 0 0 0 2px ${color}` } : { background: color }}
    />
  );
}

/** Colour key for topic statuses. Colour is always paired with a text label. */
export function StatusLegend({ className }: { className?: string }) {
  const i18n = useLanguage();
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted", className)}>
      {(Object.keys(STATUS_META) as TopicStatus[]).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <StatusDot color={STATUS_META[s].color} />
          {i18n.tx(STATUS_META[s].label)}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <StatusDot color={TARGET.color} ring />
        {i18n.tx(TARGET.label)}
      </li>
    </ul>
  );
}
