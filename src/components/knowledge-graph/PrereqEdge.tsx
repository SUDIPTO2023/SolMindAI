"use client";

import { BaseEdge, getSmoothStepPath, type Edge, type EdgeProps } from "@xyflow/react";
import type { EdgeMode } from "@/lib/graph-rules";

export type PrereqEdgeType = Edge<{ mode: EdgeMode }, "prereq">;

export const EDGE_COLOR: Record<EdgeMode, string> = {
  prereq: "#8B5CF6",
  dependent: "#22D3EE",
  normal: "rgb(148 163 184 / 0.4)",
  dim: "rgb(148 163 184 / 0.12)",
};

/** A prerequisite link. Highlighted links show a flowing pulse in the direction of learning. */
export function PrereqEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }: EdgeProps<PrereqEdgeType>) {
  const mode = data?.mode ?? "normal";
  const [path] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 16, offset: 20 });
  const lit = mode === "prereq" || mode === "dependent";
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ stroke: EDGE_COLOR[mode], strokeWidth: lit ? 2.25 : 1.4, transition: "stroke 0.3s, stroke-width 0.3s" }}
      />
      {lit && <path d={path} fill="none" stroke="#F8FAFC" strokeOpacity={0.7} strokeWidth={1.4} className="edge-flow" />}
    </>
  );
}
