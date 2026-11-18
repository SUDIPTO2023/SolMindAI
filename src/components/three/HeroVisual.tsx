"use client";

import dynamic from "next/dynamic";
import type { TopicStatus } from "@/types/learning";
import { NetworkFallback } from "./NetworkFallback";

// The 3D scene is split into its own chunk and never rendered on the server.
// Until it loads, the static SVG network is shown in the same place.
const KnowledgeNetwork = dynamic(() => import("./KnowledgeNetwork"), {
  ssr: false,
  loading: () => <NetworkFallback />,
});

export function HeroVisual({ status }: { status: TopicStatus }) {
  return <KnowledgeNetwork status={status} />;
}
