// Pure helpers for the knowledge graph: prerequisite chains, highlighting,
// evidence and confidence. Nothing here reads the store directly.

import type { GapEvidence, QuestionAttempt } from "@/types/assessment";
import type { MasteryRecord, PrerequisiteEdge, Topic, TopicStatus } from "@/types/learning";

export type NodeRole = "focus" | "prereq" | "dependent" | "dim" | "normal";
export type EdgeMode = "prereq" | "dependent" | "dim" | "normal";

export interface MasterySnapshot {
  id: string;
  label: string;
  at: string;
  mastery: MasteryRecord[];
}

function walk(edges: PrerequisiteEdge[], id: string, dir: "up" | "down", seen = new Set<string>()) {
  for (const e of edges) {
    const [from, to] = dir === "up" ? [e.to, e.from] : [e.from, e.to];
    if (from === id && !seen.has(to)) {
      seen.add(to);
      walk(edges, to, dir, seen);
    }
  }
  return seen;
}

/** Every topic that must come before `id`, directly or indirectly. */
export const ancestors = (edges: PrerequisiteEdge[], id: string) => walk(edges, id, "up");
/** Every topic that builds on `id`, directly or indirectly. */
export const descendants = (edges: PrerequisiteEdge[], id: string) => walk(edges, id, "down");

export function rolesFor(topics: Topic[], edges: PrerequisiteEdge[], focus: string | null): Record<string, NodeRole> {
  const roles: Record<string, NodeRole> = {};
  if (!focus) {
    topics.forEach((t) => (roles[t.id] = "normal"));
    return roles;
  }
  const up = ancestors(edges, focus);
  const down = descendants(edges, focus);
  topics.forEach((t) => {
    roles[t.id] = t.id === focus ? "focus" : up.has(t.id) ? "prereq" : down.has(t.id) ? "dependent" : "dim";
  });
  return roles;
}

export function edgeMode(e: PrerequisiteEdge, roles: Record<string, NodeRole>, focus: string | null): EdgeMode {
  if (!focus) return "normal";
  if (roles[e.from] === "prereq" && (roles[e.to] === "prereq" || e.to === focus)) return "prereq";
  if ((e.from === focus || roles[e.from] === "dependent") && roles[e.to] === "dependent") return "dependent";
  return "dim";
}

/** Topics in an order where every prerequisite comes before the topics that need it. */
export function topoOrder(topics: Topic[], edges: PrerequisiteEdge[]) {
  const indeg = new Map(topics.map((t) => [t.id, 0]));
  edges.forEach((e) => indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1));
  const byPosition = (a: string, b: string) => {
    const ta = topics.find((t) => t.id === a)!.layout;
    const tb = topics.find((t) => t.id === b)!.layout;
    return ta.y - tb.y || ta.x - tb.x;
  };
  const queue = topics.filter((t) => indeg.get(t.id) === 0).map((t) => t.id).sort(byPosition);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    edges.filter((e) => e.from === id).forEach((e) => {
      indeg.set(e.to, indeg.get(e.to)! - 1);
      if (indeg.get(e.to) === 0) {
        queue.push(e.to);
        queue.sort(byPosition);
      }
    });
  }
  return order;
}

/** Weak or unassessed topics on the way to the target, in the order to learn them. */
export function suggestedPath(target: string, topics: Topic[], edges: PrerequisiteEdge[], mastery: MasteryRecord[]) {
  const needed = new Set([...ancestors(edges, target), target]);
  const statusOf = (id: string) => mastery.find((m) => m.topicId === id)?.status ?? "not_assessed";
  return topoOrder(topics, edges).filter((id) => needed.has(id) && (statusOf(id) === "weak" || statusOf(id) === "not_assessed"));
}

export function diffMastery(before: MasteryRecord[] | null, after: MasteryRecord[]) {
  const changes: Record<string, { from: TopicStatus; to: TopicStatus }> = {};
  if (!before) return changes;
  after.forEach((a) => {
    const b = before.find((x) => x.topicId === a.topicId);
    if (b && b.status !== a.status) changes[a.topicId] = { from: b.status, to: a.status };
  });
  return changes;
}

export function topicEvidence(topicId: string, attempts: QuestionAttempt[], gaps: GapEvidence[]) {
  const own = attempts.filter((a) => a.topicId === topicId);
  const findings = gaps.filter((g) => g.recommendedTopicId === topicId && g.status === "verified");
  return { attempts: own, findings, count: own.length + findings.length };
}

/** Confidence grows with the number of independent pieces of evidence. */
export function confidenceFor(count: number): { label: string; level: 0 | 1 | 2 | 3 } {
  if (count === 0) return { label: "No evidence yet", level: 0 };
  if (count <= 2) return { label: "Low", level: 1 };
  if (count <= 4) return { label: "Medium", level: 2 };
  return { label: "High", level: 3 };
}

/** How one topic's status moved across the saved snapshots (repeats removed). */
export function statusHistory(topicId: string, snapshots: MasterySnapshot[]) {
  const out: { label: string; status: TopicStatus }[] = [];
  snapshots.forEach((s) => {
    const status = s.mastery.find((m) => m.topicId === topicId)?.status ?? "not_assessed";
    if (out.at(-1)?.status !== status) out.push({ label: s.label, status });
  });
  return out;
}
