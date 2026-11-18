import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export const metadata: Metadata = { title: "Dashboard" };

// Page 03: Student Dashboard.
export default function DashboardPage() {
  return <DashboardOverview />;
}
