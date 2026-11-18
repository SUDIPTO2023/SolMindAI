import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = { title: "Learning Analytics" };

// Page 07: Learning Analytics.
export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
