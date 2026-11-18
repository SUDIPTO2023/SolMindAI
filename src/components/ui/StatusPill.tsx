"use client";

import { STATUS_META } from "@/lib/constants";
import type { TopicStatus } from "@/types/learning";
import { useLanguage } from "@/i18n/use-language";

/** Topic status as colour plus text, never colour alone. */
export function StatusPill({ status }: { status: TopicStatus }) {
  const i18n = useLanguage();
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: `${meta.color}1f`, color: meta.ink }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} aria-hidden="true" />
      {i18n.tx(meta.label)}
    </span>
  );
}
