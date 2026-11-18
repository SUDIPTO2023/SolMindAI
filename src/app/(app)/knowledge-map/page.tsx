import type { Metadata } from "next";
import { KnowledgeMap } from "@/components/knowledge-graph/KnowledgeMap";

export const metadata: Metadata = { title: "Knowledge Map" };

// Page 06: Interactive Knowledge Graph.
export default function KnowledgeMapPage() {
  return <KnowledgeMap />;
}
