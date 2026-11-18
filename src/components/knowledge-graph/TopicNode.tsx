"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { motion } from "motion/react";
import { ArrowRight, Crosshair } from "lucide-react";
import { STATUS_META, TARGET } from "@/lib/constants";
import type { NodeRole } from "@/lib/graph-rules";
import type { TopicStatus } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

export type TopicNodeData = {
  title: string;
  status: TopicStatus;
  score: number;
  isTarget: boolean;
  role: NodeRole;
  change: { from: TopicStatus; to: TopicStatus } | null;
  filteredOut: boolean;
  onSelect: (id: string) => void;
};
export type TopicNodeType = Node<TopicNodeData, "topic">;

const ROLE_RING: Record<NodeRole, string> = {
  focus: "ring-2 ring-text/80 shadow-[0_0_0_6px_rgb(248_250_252/0.06),0_18px_40px_-12px_rgb(0_0_0/0.8)]",
  prereq: "ring-1 ring-purple/70 shadow-[0_0_24px_-6px_rgb(139_92_246/0.55)]",
  dependent: "ring-1 ring-cyan/60 shadow-[0_0_24px_-6px_rgb(34_211_238/0.45)]",
  dim: "",
  normal: "",
};

function TopicNodeView({ id, data }: NodeProps<TopicNodeType>) {
  const i18n = useLanguage();
  const meta = STATUS_META[data.status];
  const faded = data.role === "dim" || data.filteredOut;
  return (
    <div
      className="relative w-[188px] transition-opacity duration-300"
      style={{ opacity: faded ? 0.28 : 1 }}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-transparent" />
      {data.isTarget && (
        <span
          aria-hidden="true"
          className="absolute -inset-[7px] rounded-[18px] border-2 border-dashed"
          style={{ borderColor: `${TARGET.color}aa` }}
        />
      )}
      <button
        type="button"
        onClick={() => data.onSelect(id)}
        aria-pressed={data.role === "focus"}
        aria-label={i18n.tx(`${data.title}: ${meta.label}${data.isTarget ? ", current target" : ""}`)}
        className={cn(
          "relative block w-full overflow-hidden rounded-xl border border-line-strong bg-surface/95 px-3.5 pb-3 pt-2.5 text-left backdrop-blur transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-ink/30",
          ROLE_RING[data.role],
        )}
      >
        <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: meta.color }} aria-hidden="true" />
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: meta.ink }}>
            <motion.span
              key={data.status}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: meta.color }}
            />
            {i18n.tx(meta.label)}
          </span>
          {data.isTarget && (
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: TARGET.ink }}>
              <Crosshair size={11} aria-hidden="true" />{" "}{i18n.t("Target")}</span>
          )}
        </span>
        <span className="mt-1 block text-[14px] font-semibold leading-snug text-text">{i18n.tx(data.title)}</span>
        <span className="mt-2.5 flex items-center gap-2">
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
            <motion.span
              className="block h-full rounded-full"
              style={{ background: meta.color }}
              initial={false}
              animate={{ width: `${data.status === "not_assessed" ? 0 : data.score}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          <span className="w-8 text-right font-mono text-[11px] tabular-nums text-muted">
            {i18n.tx(data.status === "not_assessed" ? "–" : `${data.score}%`)}
          </span>
        </span>
      </button>
      {data.change && (
        <motion.span
          key={`${data.change.from}-${data.change.to}`}
          initial={{ opacity: 0, y: 6, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="absolute -top-3 right-2 flex items-center gap-1 rounded-full border border-ink/15 bg-base px-2 py-0.5 text-[10px] font-semibold shadow-lg"
        >
          <span style={{ color: STATUS_META[data.change.from].ink }}>{i18n.tx(STATUS_META[data.change.from].label)}</span>
          <ArrowRight size={10} className="text-muted" aria-label="to" />
          <span style={{ color: STATUS_META[data.change.to].ink }}>{i18n.tx(STATUS_META[data.change.to].label)}</span>
        </motion.span>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-transparent" />
    </div>
  );
}

export const TopicNode = memo(TopicNodeView);
