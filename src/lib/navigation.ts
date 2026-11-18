import {
  BookOpen,
  ChartColumn,
  ClipboardCheck,
  History,
  LayoutDashboard,
  MessagesSquare,
  Network,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string | null; // null = planned after the demo, shown disabled
  icon: LucideIcon;
  section: string; // breadcrumb parent
}

export const APP_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Overview" },
  { label: "Learn", href: null, icon: BookOpen, section: "Learning" },
  { label: "Diagnostic Assessment", href: "/assessment/diagnostic", icon: ClipboardCheck, section: "Assessment" },
  { label: "AI Tutor", href: "/tutor", icon: MessagesSquare, section: "Learning" },
  { label: "Knowledge Map", href: "/knowledge-map", icon: Network, section: "Progress" },
  { label: "Analytics", href: "/analytics", icon: ChartColumn, section: "Progress" },
  { label: "Learning History", href: null, icon: History, section: "Progress" },
];

export const navItemFor = (pathname: string) => APP_NAV.find((n) => n.href === pathname) ?? null;
