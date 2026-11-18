"use client";

import { motion, type Variants } from "motion/react";
import { ChartColumn, Layers, MessagesSquare, Network, TrendingUp, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

// Each card has its own small visual that reacts on hover or keyboard focus.

const lift: Variants = { rest: { y: 0 }, hover: { y: -4 } };

function GraphVisual() {
  const nodes = [
    [20, 18], [60, 14], [40, 46], [86, 44], [62, 76],
  ];
  const edges = [[0, 2], [1, 2], [2, 4], [3, 4]];
  return (
    <svg viewBox="0 0 106 92" className="h-full w-full">
      {edges.map(([a, b]) => (
        <line key={`${a}${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#8B5CF6" strokeOpacity="0.45" />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={i === 4 ? 6 : 4.5}
          fill={i === 4 ? "#22D3EE" : "#64748B"}
          variants={{ rest: { fill: i === 4 ? "#22D3EE" : "#64748B" }, hover: { fill: i === 4 ? "#22D3EE" : i === 3 ? "#64748B" : "#8B5CF6" } }}
          transition={{ delay: i * 0.06 }}
        />
      ))}
    </svg>
  );
}

function LayersVisual() {
  const i18n = useLanguage();
  return (
    <svg viewBox="0 0 106 92" className="h-full w-full">
      <motion.g variants={{ rest: { y: 0 }, hover: { y: -8 } }}>
        <rect x="14" y="20" width="78" height="22" rx="5" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" />
        <text x="53" y="35" textAnchor="middle" fill="var(--color-accent-soft)" fontSize="9" fontFamily="var(--font-geist-mono)">{i18n.t("concept")}</text>
      </motion.g>
      <motion.g variants={{ rest: { y: 0 }, hover: { y: 8 } }}>
        <rect x="14" y="50" width="78" height="22" rx="5" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" />
        <text x="53" y="65" textAnchor="middle" fill="var(--color-blue-soft)" fontSize="9" fontFamily="var(--font-geist-mono)">{i18n.t("maths")}</text>
      </motion.g>
    </svg>
  );
}

function ChatVisual() {
  const i18n = useLanguage();
  return (
    <svg viewBox="0 0 106 92" className="h-full w-full">
      <rect x="10" y="12" width="58" height="16" rx="8" fill="var(--color-elevated)" stroke="rgb(148 163 184 / 0.3)" />
      <rect x="40" y="36" width="56" height="16" rx="8" fill="#7C3AED" fillOpacity="0.55" />
      <motion.rect
        x="10" y="60" width="66" height="16" rx="8" fill="var(--color-elevated)" stroke="#22D3EE"
        variants={{ rest: { opacity: 0, x: -6 }, hover: { opacity: 1, x: 0 } }}
      />
      <motion.text x="18" y="71" fill="var(--color-cyan-soft)" fontSize="8.5" fontFamily="var(--font-geist-mono)" variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}>{i18n.t("what acts on it?")}</motion.text>
    </svg>
  );
}

function StepsVisual() {
  return (
    <svg viewBox="0 0 106 92" className="h-full w-full">
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={12 + i * 22} y={70 - i * 14} width="18" height={14 + i * 14} rx="3" fill="#3B82F6" fillOpacity={0.15 + i * 0.12} />
      ))}
      <motion.circle cy="0" r="5" fill="#22D3EE" variants={{ rest: { cx: 43, cy: 50 }, hover: { cx: 65, cy: 36 } }} transition={{ type: "spring", stiffness: 260, damping: 18 }} />
    </svg>
  );
}

function BarsVisual() {
  const bars = [0.45, 0.7, 0.55, 0.85];
  const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#16A34A"];
  return (
    <svg viewBox="0 0 106 92" className="h-full w-full">
      <line x1="10" y1="80" x2="96" y2="80" stroke="rgb(148 163 184 / 0.3)" />
      {bars.map((h, i) => (
        <motion.rect
          key={i}
          x={16 + i * 20}
          width="12"
          rx="2"
          fill={colors[i]}
          variants={{ rest: { height: h * 34, y: 80 - h * 34 }, hover: { height: h * 64, y: 80 - h * 64 } }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </svg>
  );
}

const CARDS: { title: string; body: string; icon: LucideIcon; visual: () => React.ReactElement; span: string }[] = [
  {
    title: "Prerequisite-Aware Knowledge Graph",
    body: "Maps which concepts each topic depends on, and checks those foundations before moving on.",
    icon: Network,
    visual: GraphVisual,
    span: "lg:col-span-2",
  },
  {
    title: "Dual-Layer Gap Detection",
    body: "Reads the working, not just the answer, to separate a gap in the idea from a slip in the maths.",
    icon: Layers,
    visual: LayersVisual,
    span: "lg:col-span-2",
  },
  {
    title: "Socratic AI Tutor",
    body: "Guides with questions and staged hints, so students reach the answer through their own reasoning.",
    icon: MessagesSquare,
    visual: ChatVisual,
    span: "lg:col-span-2",
  },
  {
    title: "Adaptive Challenge Engine",
    body: "Picks the next question from the evidence: harder after success, a step back to foundations after a miss.",
    icon: TrendingUp,
    visual: StepsVisual,
    span: "lg:col-span-3",
  },
  {
    title: "Knowledge-Based Learning Analytics",
    body: "Shows mastery, accuracy by gap type, difficulty and Bloom level, all from the same learning record.",
    icon: ChartColumn,
    visual: BarsVisual,
    span: "lg:col-span-3",
  },
];

export function InnovationSection() {
  const i18n = useLanguage();
  return (
    <section id="features" className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <SectionHeading
            kicker="Core features"
            title="Five innovations, one learning journey"
            lead="Each one answers a different question about the learner. Together they turn a wrong answer into a plan."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {CARDS.map((c, i) => (
            <motion.article
              key={c.title}
              tabIndex={0}
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileFocus="hover"
              variants={lift}
              className={cn(
                "panel group flex flex-col gap-5 p-6 outline-none transition-colors hover:border-purple/40 focus-visible:border-purple/60 sm:flex-row lg:flex-col",
                c.span,
                i === 4 && "sm:col-span-2",
                (i === 3 || i === 4) && "lg:flex-row",
              )}
            >
              <div className="h-24 w-28 shrink-0 rounded-md border border-line bg-base/60 p-2">
                <c.visual />
              </div>
              <div>
                <div className="flex items-center gap-2 text-accent">
                  <c.icon size={17} aria-hidden="true" />
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{i18n.tx(c.title)}</h3>
                <p className="mt-2 text-[15px] text-muted">{i18n.tx(c.body)}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
