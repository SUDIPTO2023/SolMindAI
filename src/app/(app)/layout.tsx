import { AppShell } from "@/components/layout/AppShell";

// A route group: the five learning pages share one shell (sidebar + top bar)
// without "(app)" appearing in their URLs.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
