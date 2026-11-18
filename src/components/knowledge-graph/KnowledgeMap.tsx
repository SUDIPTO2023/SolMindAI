"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react";
import { motion } from "motion/react";
import { Network, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { diffMastery, edgeMode, rolesFor } from "@/lib/graph-rules";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useServiceData } from "@/lib/use-service-data";
import { learningService } from "@/services/service-provider";
import { useLearningStore } from "@/store/learning-store";
import type { KnowledgeGraph, MasteryRecord, TopicStatus } from "@/types/learning";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/theme/theme-store";
import { GraphToolbar } from "./GraphToolbar";
import { EDGE_COLOR, PrereqEdge, type PrereqEdgeType } from "./PrereqEdge";
import { ProgressTimeline } from "./ProgressTimeline";
import { TopicDetailPanel } from "./TopicDetailPanel";
import { TopicListView } from "./TopicListView";
import { TopicNode, type TopicNodeType } from "./TopicNode";
import { useLanguage } from "@/i18n/use-language";

const nodeTypes = { topic: TopicNode } satisfies NodeTypes;
const edgeTypes = { prereq: PrereqEdge } satisfies EdgeTypes;
const loadGraph = learningService.getKnowledgeGraph;

// The layout percentages from the topic data, scaled to canvas pixels.
const X_SCALE = 11.5;
const Y_SCALE = 7.4;
const NODE_HALF_WIDTH = 94;

interface CanvasProps {
  graph: KnowledgeGraph;
  mastery: MasteryRecord[];
  focusId: string | null;
  changes: Record<string, { from: TopicStatus; to: TopicStatus }>;
  hidden: Set<TopicStatus>;
  onFocus: (id: string | null) => void;
  onToggleStatus: (s: TopicStatus) => void;
}

function Canvas({ graph, mastery, focusId, changes, hidden, onFocus, onToggleStatus }: CanvasProps) {
  const theme = useThemeStore((s) => s.theme);
  const flow = useReactFlow();
  const reduce = usePrefersReducedMotion();
  const roles = useMemo(() => rolesFor(graph.topics, graph.edges, focusId), [graph, focusId]);
  const statusOf = useCallback((id: string) => mastery.find((m) => m.topicId === id) ?? { topicId: id, status: "not_assessed" as const, score: 0 }, [mastery]);
  const select = useCallback((id: string) => onFocus(id), [onFocus]);

  const nodes = useMemo<TopicNodeType[]>(
    () =>
      graph.topics.map((t) => {
        const rec = statusOf(t.id);
        return {
          id: t.id,
          type: "topic",
          position: { x: t.layout.x * X_SCALE - NODE_HALF_WIDTH, y: t.layout.y * Y_SCALE },
          data: {
            title: t.title,
            status: rec.status,
            score: rec.score,
            isTarget: t.id === graph.targetTopicId,
            role: roles[t.id],
            change: changes[t.id] ?? null,
            filteredOut: hidden.has(rec.status),
            onSelect: select,
          },
          draggable: false,
          selectable: false,
          focusable: false,
        };
      }),
    [graph, roles, changes, hidden, statusOf, select],
  );

  const edges = useMemo<PrereqEdgeType[]>(
    () =>
      graph.edges.map((e) => {
        const mode = edgeMode(e, roles, focusId);
        return {
          id: `${e.from}->${e.to}`,
          source: e.from,
          target: e.to,
          type: "prereq",
          data: { mode },
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR[mode], width: 16, height: 16 },
          zIndex: mode === "prereq" || mode === "dependent" ? 1 : 0,
        };
      }),
    [graph, roles, focusId],
  );

  // Glide the camera to the selected topic and its neighbours.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const duration = reduce ? 0 : 650;
    if (!focusId) {
      void flow.fitView({ duration, padding: 0.12 });
      return;
    }
    const near = new Set([focusId]);
    graph.edges.forEach((e) => {
      if (e.from === focusId) near.add(e.to);
      if (e.to === focusId) near.add(e.from);
    });
    void flow.fitView({ nodes: [...near].map((id) => ({ id })), duration, padding: 0.35, maxZoom: 1.15 });
  }, [focusId, flow, graph, reduce]);

  const counts = useMemo(() => {
    const c = { mastered: 0, developing: 0, weak: 0, not_assessed: 0 } as Record<TopicStatus, number>;
    graph.topics.forEach((t) => c[statusOf(t.id).status]++);
    return c;
  }, [graph, statusOf]);

  return (
    <>
      <GraphToolbar
        counts={counts}
        hidden={hidden}
        onToggle={onToggleStatus}
        focusTitle={focusId ? graph.topics.find((t) => t.id === focusId)?.title ?? null : null}
        onClearFocus={() => onFocus(null)}
      />
      <div className="relative h-[520px] sm:h-[600px]">
        <ReactFlow<TopicNodeType, PrereqEdgeType>
          className="solmind-flow"
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode={theme}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.35}
          maxZoom={1.75}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          // A click handler also tells React Flow that nodes take pointer events.
          onNodeClick={(_, node) => onFocus(node.id)}
          onPaneClick={() => onFocus(null)}
          proOptions={{ hideAttribution: false }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="rgb(148 163 184 / 0.16)" />
        </ReactFlow>
      </div>
    </>
  );
}

/** Page 06: interactive prerequisite knowledge graph, driven by the shared learning record. */
export function KnowledgeMap() {
  const i18n = useLanguage();
  const graphData = useServiceData(loadGraph);
  const s = useLearningStore();
  const reduce = usePrefersReducedMotion();
  // Small screens open on the list; the graph is one tap away. (Client-only: rendered after hydration.)
  const [view, setView] = useState<"graph" | "list">(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches ? "list" : "graph",
  );
  const [focusId, setFocusId] = useState<string | null>(s.selectedTopicId);
  const [hidden, setHidden] = useState<Set<TopicStatus>>(new Set());
  const [compare, setCompare] = useState<"previous" | "start">("previous");
  const [viewIndex, setViewIndex] = useState<number | null>(null); // null = now
  const [replaying, setReplaying] = useState(false);

  const snapshots = s.masteryHistory;
  const last = snapshots.length - 1;
  const index = viewIndex ?? last;
  const mastery = index === last ? s.mastery : snapshots[index].mastery;
  const base = compare === "start" ? snapshots[0].mastery : index > 0 ? snapshots[index - 1].mastery : null;
  const changes = useMemo(() => (index === 0 && compare === "start" ? {} : diffMastery(base, mastery)), [base, mastery, index, compare]);

  const selectTopic = s.selectTopic;
  const focus = useCallback(
    (id: string | null) => {
      setFocusId(id);
      if (id) selectTopic(id);
    },
    [selectTopic],
  );

  // Replay: step through every snapshot so the change plays out on the map.
  useEffect(() => {
    if (!replaying) return;
    const timer = setInterval(() => {
      setViewIndex((i) => {
        const next = (i ?? 0) + 1;
        if (next >= last) {
          setReplaying(false);
          return null;
        }
        return next;
      });
    }, reduce ? 300 : 1700);
    return () => clearInterval(timer);
  }, [replaying, last, reduce]);

  const toggleReplay = () => {
    if (replaying) {
      setReplaying(false);
      return;
    }
    setCompare("previous");
    setViewIndex(0);
    setReplaying(true);
  };

  if (graphData.loading) {
    return (
      <div role="status" aria-label={i18n.t("Loading the knowledge map")} className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-md bg-ink/[0.06]" />
        <div className="h-[600px] animate-pulse rounded-lg bg-ink/[0.04]" />
      </div>
    );
  }
  if (graphData.error || !graphData.data) {
    return (
      <EmptyState icon={Network} title="The knowledge map could not load" body="Nothing was lost. Try loading it again.">
        <Button onClick={graphData.retry}><RefreshCw size={16} aria-hidden="true" />{" "}{i18n.t("Try again")}</Button>
      </EmptyState>
    );
  }
  const graph = graphData.data;

  return (
    <>
      <PageHeader
        title="Knowledge Map"
        description="Every topic in the chapter, what it builds on, and where you stand now. Select a topic to trace its prerequisites."
        actions={
          <div role="tablist" aria-label={i18n.t("Map view")} className="flex rounded-lg border border-line bg-ink/[0.02] p-1">
            {(["graph", "list"] as const).map((v) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className="relative rounded-md px-4 py-2 text-sm font-medium">
                {view === v && <motion.span layoutId="map-view" className="absolute inset-0 rounded-md bg-elevated" />}
                <span className={cn("relative", view === v ? "text-text" : "text-muted")}>{i18n.tx(v === "graph" ? "Graph" : "List")}</span>
              </button>
            ))}
          </div>
        }
      />

      <ProgressTimeline
        snapshots={snapshots}
        index={index}
        onSelect={(i) => {
          setReplaying(false);
          setViewIndex(i === last ? null : i);
        }}
        compare={compare}
        onCompare={setCompare}
        replaying={replaying}
        onReplay={toggleReplay}
        changes={changes}
        topics={graph.topics}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel overflow-hidden" aria-label={i18n.tx(view === "graph" ? "Knowledge graph" : "Topic list")}>
          {view === "graph" ? (
            <ReactFlowProvider>
              <Canvas
                graph={graph}
                mastery={mastery}
                focusId={focusId}
                changes={changes}
                hidden={hidden}
                onFocus={focus}
                onToggleStatus={(st) =>
                  setHidden((h) => {
                    const next = new Set(h);
                    if (next.has(st)) next.delete(st);
                    else next.add(st);
                    return next;
                  })
                }
              />
            </ReactFlowProvider>
          ) : (
            <TopicListView graph={graph} mastery={mastery} focusId={focusId} changes={changes} onFocus={focus} />
          )}
        </section>
        <TopicDetailPanel
          graph={graph}
          focusId={focusId}
          mastery={mastery}
          attempts={s.attempts}
          gaps={s.gapEvidence}
          snapshots={snapshots.slice(0, index + 1)}
          historic={index !== last}
          onFocus={focus}
        />
      </div>
      <p className="mt-4 text-xs text-muted">{i18n.t("Starting statuses come from a fictional sample learner. Prerequisite links are a proposal pending review by the team’s Physics lead.")}</p>
    </>
  );
}
