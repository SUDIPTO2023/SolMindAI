import { BASELINE_MASTERY } from "@/data/demo-scenarios";
import { KNOWLEDGE_GRAPH } from "@/data/topics";
import { STATUS_META, TARGET } from "@/lib/constants";
import type { TopicStatus } from "@/types/learning";

// Turns the 2D concept-map layout into 3D positions, so the hero network,
// its static fallback and the scope map all show the same graph.

const DEPTH = [0.9, -1.2, 0.3, 1.4, -0.4, -1.5, 0.8, 0.2, 1.1, -0.9, 0];

export const NETWORK_NODES = KNOWLEDGE_GRAPH.topics.map((t, i) => ({
  id: t.id,
  label: t.title,
  position: [(t.layout.x - 50) / 9, (50 - t.layout.y) / 11, DEPTH[i % DEPTH.length]] as [number, number, number],
  layout: t.layout,
}));

export const NETWORK_EDGES = KNOWLEDGE_GRAPH.edges.map((e) => [
  NETWORK_NODES.findIndex((n) => n.id === e.from),
  NETWORK_NODES.findIndex((n) => n.id === e.to),
]) as [number, number][];

export const HERO_ANIMATED_TOPIC = "net-force";

/** Colour of a node in the hero: target topic, animated topic, or the demo learner's status. */
export function heroNodeColor(id: string, animatedStatus: TopicStatus) {
  if (id === KNOWLEDGE_GRAPH.targetTopicId) return TARGET.color;
  if (id === HERO_ANIMATED_TOPIC) return STATUS_META[animatedStatus].color;
  const status = BASELINE_MASTERY.find((m) => m.topicId === id)?.status ?? "not_assessed";
  return STATUS_META[status].color;
}
