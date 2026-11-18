"use client";

import type { TopicStatus } from "@/types/learning";
import { NETWORK_EDGES, NETWORK_NODES, heroNodeColor } from "./network-geometry";
import { useLanguage } from "@/i18n/use-language";

/** Static SVG version of the hero network. Shown while the 3D scene loads and when WebGL is unavailable. */
export function NetworkFallback({ animatedStatus = "weak" }: { animatedStatus?: TopicStatus }) {
  const i18n = useLanguage();
  const pos = (i: number) => ({ x: 40 + NETWORK_NODES[i].layout.x * 5.2, y: 30 + NETWORK_NODES[i].layout.y * 4.4 });
  return (
    <svg viewBox="0 0 600 500" className="h-full w-full" role="img" aria-label={i18n.t("Knowledge network of eleven Physics topics connected by prerequisite links")}>
      {NETWORK_EDGES.map(([a, b]) => {
        const p = pos(a);
        const q = pos(b);
        return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#8B5CF6" strokeOpacity="0.35" strokeWidth="1.5" />;
      })}
      {NETWORK_NODES.map((n, i) => {
        const p = pos(i);
        const c = heroNodeColor(n.id, animatedStatus);
        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r="16" fill={c} opacity="0.18" />
            <circle cx={p.x} cy={p.y} r="7" fill={c} />
          </g>
        );
      })}
    </svg>
  );
}
