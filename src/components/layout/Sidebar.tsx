"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Logo } from "@/components/ui/Logo";
import { APP_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

export function SidebarNav({ onNavigate, layoutId }: { onNavigate?: () => void; layoutId: string }) {
  const i18n = useLanguage();
  const pathname = usePathname();
  return (
    <nav aria-label={i18n.t("App")} className="flex flex-col gap-0.5">
      {APP_NAV.map((item) => {
        const active = item.href === pathname;
        if (!item.href) {
          return (
            <span
              key={item.label}
              aria-disabled="true"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted/50"
            >
              <item.icon size={18} aria-hidden="true" />
              <span className="flex-1">{i18n.tx(item.label)}</span>
              <span className="rounded border border-line px-1.5 text-[10px]">{i18n.t("Soon")}</span>
            </span>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              active ? "text-text" : "text-muted hover:bg-ink/[0.03] hover:text-text",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md border border-purple/30 bg-purple/12"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <item.icon size={18} className={cn("relative", active && "text-accent-soft")} aria-hidden="true" />
            <span className="relative">{i18n.tx(item.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarScope() {
  const i18n = useLanguage();
  return (
    <div className="rounded-md border border-line bg-base/50 p-3 text-xs">
      <p className="font-medium text-text">{i18n.t("Class 11 Physics")}</p>
      <p className="mt-0.5 text-muted">{i18n.t("Newton’s Laws of Motion")}</p>
    </div>
  );
}

/** Fixed sidebar for large screens. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-base-2 px-3 py-4 lg:flex">
      <Link href="/" className="px-3 py-1.5" aria-label="SOLMIND AI home">
        <Logo />
      </Link>
      <div className="mt-6 flex-1">
        <SidebarNav layoutId="sidebar-active" />
      </div>
      <SidebarScope />
    </aside>
  );
}
