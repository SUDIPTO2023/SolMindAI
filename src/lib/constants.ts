import type { TopicStatus } from "@/types/learning";

// color: dots, bars and graph nodes. ink: the colour for text, which the light theme darkens for contrast.
export const STATUS_META: Record<TopicStatus, { label: string; color: string; ink: string }> = {
  mastered: { label: "Mastered", color: "#16A34A", ink: "var(--c-ink-mastered)" },
  developing: { label: "Developing", color: "#F59E0B", ink: "var(--c-ink-developing)" },
  weak: { label: "Weak", color: "#EF4444", ink: "var(--c-ink-weak)" },
  not_assessed: { label: "Not assessed", color: "#64748B", ink: "var(--c-ink-not-assessed)" },
};

export const TARGET = { label: "Current target", color: "#22D3EE", ink: "var(--c-target-ink)" } as const;

export const LANDING_NAV = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Core Features" },
  { href: "#scope", label: "Learning Scope" },
  { href: "#about", label: "About" },
] as const;

export const DEMO_ENTRY_ROUTE = "/onboarding";
