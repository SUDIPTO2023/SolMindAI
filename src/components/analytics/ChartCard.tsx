"use client";

import { motion } from "motion/react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

/** A titled card for one chart, with an honest empty state when there is no data. */
export function ChartCard({
  title,
  description,
  empty,
  emptyText,
  className,
  children,
  delay = 0,
}: {
  title: string;
  description?: string;
  empty?: boolean;
  emptyText?: string;
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const i18n = useLanguage();
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("panel flex flex-col p-5", className)}
    >
      <h2 className="font-semibold">{i18n.tx(title)}</h2>
      {description && <p className="mt-1 text-sm text-muted">{i18n.tx(description)}</p>}
      <div className="mt-4 flex-1">
        {empty ? (
          <div className="grid h-full min-h-[180px] place-items-center rounded-md border border-dashed border-line text-center">
            <div className="max-w-xs px-4">
              <BarChart3 size={20} className="mx-auto text-muted" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted">{i18n.tx(emptyText ?? "Not enough data yet.")}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.section>
  );
}

interface TooltipEntry {
  name?: string | number;
  value?: unknown;
  color?: string;
  payload?: Record<string, unknown>;
}

/** Dark tooltip used by every chart. Recharts injects the props. */
export function ChartTooltip({
  active,
  payload,
  label,
  suffix = "%",
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: string | number;
  suffix?: string;
}) {
  const i18n = useLanguage();
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line-strong bg-elevated px-3 py-2 text-xs shadow-xl">
      {label !== undefined && <p className="mb-1 font-medium text-text">{i18n.tx(label)}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color ?? (p.payload?.color as string) ?? "#8B5CF6" }} />
          {i18n.tx(p.name)}: <span className="font-mono text-text">{i18n.tx(p.value === null || p.value === undefined ? "No data" : `${p.value}${suffix}`)}</span>
        </p>
      ))}
    </div>
  );
}

export const AXIS = { fill: "var(--color-muted)", fontSize: 12 } as const;
export const GRID = "rgb(148 163 184 / 0.12)";
