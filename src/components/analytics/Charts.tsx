"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Analytics } from "@/lib/analytics-rules";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { AXIS, ChartTooltip, GRID } from "./ChartCard";
import { clearStringCache } from "recharts/es6/util/DOMUtils";
import { useLanguage } from "@/i18n/use-language";
import { useLanguageStore } from "@/i18n/language-provider";

// Recharts caches measured label sizes for the whole session. Clear them the moment the
// language changes, before charts redraw, so labels are measured afresh in the new language.
if (typeof window !== "undefined") {
  useLanguageStore.subscribe((s, prev) => {
    if (s.language !== prev.language) clearStringCache();
  });
}

const legendStyle = { fontSize: 12, color: "var(--color-muted)" };

/** "Medium practice solved" becomes "Medium" on the axis; the tooltip keeps the full label. */
const shortStep = (label: string) => (label === "Gap verified" ? "Gap found" : label.split(" ")[0]);

export function TopicMasteryChart({ data }: { data: Analytics["topicMastery"] }) {
  const animate = !usePrefersReducedMotion();
  const i18n = useLanguage();
  return (
    <ResponsiveContainer key={i18n.language} width="100%" height={data.length * 34 + 20}>
      <BarChart data={data.map((d) => ({ ...d, title: i18n.tx(d.title), label: i18n.tx(d.label) }))} layout="vertical" margin={{ top: 0, right: 84, bottom: 0, left: 0 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} unit="%" />
        <YAxis type="category" dataKey="title" tick={AXIS} axisLine={false} tickLine={false} width={150} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(148 163 184 / 0.06)" }} />
        <Bar dataKey="score" name={i18n.tx("Mastery")} radius={[0, 6, 6, 0]} minPointSize={3} isAnimationActive={animate} animationDuration={900}>
          {data.map((d) => <Cell key={d.id} fill={d.color} />)}
          <LabelList dataKey="label" position="right" fill="var(--color-muted)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProgressChart({ data }: { data: Analytics["progress"] }) {
  const animate = !usePrefersReducedMotion();
  const i18n = useLanguage();
  return (
    <ResponsiveContainer key={i18n.language} width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 34, bottom: 0, left: -12 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval={0} tickFormatter={(l: string) => i18n.tx(shortStep(l))} />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Line type="monotone" dataKey="chapter" name={i18n.tx("Chapter mastery")} stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: "#8B5CF6" }} isAnimationActive={animate} />
        <Line type="monotone" dataKey="netForce" name={i18n.tx("Net Force")} stroke="#22D3EE" strokeWidth={2.5} dot={{ r: 4, fill: "#22D3EE" }} connectNulls={false} isAnimationActive={animate} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function LayerChart({ data }: { data: Analytics["layers"] }) {
  const animate = !usePrefersReducedMotion();
  const i18n = useLanguage();
  const rows = data.map((d) => ({ ...d, layer: i18n.tx(d.layer), shown: d.pct ?? 0, label: d.total ? `${d.pct}% (${d.correct}/${d.total})` : i18n.tx("No data") }));
  return (
    <ResponsiveContainer key={i18n.language} width="100%" height={200}>
      <BarChart data={rows} margin={{ top: 24, right: 8, bottom: 0, left: -18 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="layer" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(148 163 184 / 0.06)" }} />
        <Bar dataKey="shown" name={i18n.tx("Accuracy")} radius={[6, 6, 0, 0]} isAnimationActive={animate}>
          <Cell fill="#8B5CF6" />
          <Cell fill="#3B82F6" />
          <LabelList dataKey="label" position="top" fill="var(--color-muted)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DifficultyChart({ data }: { data: Analytics["difficulty"] }) {
  const animate = !usePrefersReducedMotion();
  const i18n = useLanguage();
  return (
    <ResponsiveContainer key={i18n.language} width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="level" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(l: string) => i18n.tx(l)} />
        <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip suffix="" />} cursor={{ fill: "rgb(148 163 184 / 0.06)" }} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="correct" name={i18n.tx("Correct")} stackId="a" fill="#16A34A" isAnimationActive={animate} />
        <Bar dataKey="incorrect" name={i18n.tx("Not yet correct")} stackId="a" fill="#EF4444" radius={[6, 6, 0, 0]} isAnimationActive={animate} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BloomChart({ data }: { data: Analytics["bloom"] }) {
  const animate = !usePrefersReducedMotion();
  const i18n = useLanguage();
  return (
    <ResponsiveContainer key={i18n.language} width="100%" height={230}>
      <BarChart data={data.map((d) => ({ ...d, label: i18n.tx(d.label) }))} margin={{ top: 24, right: 8, bottom: 4, left: -18 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="level" tick={{ ...AXIS, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={52} tickFormatter={(l: string) => i18n.tx(l)} />
        <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} unit="%" />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(148 163 184 / 0.06)" }} />
        <Bar dataKey="shown" name={i18n.tx("Accuracy")} fill="#22D3EE" radius={[6, 6, 0, 0]} minPointSize={2} isAnimationActive={animate}>
          <LabelList dataKey="label" position="top" fill="var(--color-muted)" fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IndependenceChart({ data }: { data: Analytics["independence"] }) {
  const i18n = useLanguage();
  const animate = !usePrefersReducedMotion();
  const total = data.slices.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer key={i18n.language} width="100%" height={210}>
        <PieChart>
          <Pie data={data.slices.map((sl) => ({ ...sl, name: i18n.tx(sl.name) }))} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2} stroke="none" isAnimationActive={animate}>
            {data.slices.map((s) => <Cell key={s.name} fill={s.color} />)}
          </Pie>
          <Tooltip content={<ChartTooltip suffix="" />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-mono text-2xl font-semibold tabular-nums">{total}</p>
          <p className="text-xs text-muted">{i18n.t("answers")}</p>
        </div>
      </div>
    </div>
  );
}

export function ProgressSparkline({ data }: { data: Analytics["progress"] }) {
  const animate = !usePrefersReducedMotion();
  const i18n = useLanguage();
  return (
    <ResponsiveContainer key={i18n.language} width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8B5CF6" stopOpacity={0.45} />
            <stop offset="1" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" hide />
        <YAxis domain={[0, 100]} hide />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="chapter" name={i18n.tx("Chapter mastery")} stroke="#8B5CF6" strokeWidth={2} fill="url(#spark)" isAnimationActive={animate} dot={{ r: 3, fill: "#8B5CF6" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
