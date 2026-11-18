"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { HydrationGate } from "./HydrationGate";
import { Sidebar, SidebarNav, SidebarScope } from "./Sidebar";
import { Topbar } from "./Topbar";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { useLanguage } from "@/i18n/use-language";

/** Shared layout for Dashboard, Diagnostic, Tutor, Knowledge Map and Analytics. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const i18n = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Drawer navigation for tablet and mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              type="button"
              aria-label={i18n.t("Close navigation")}
              className="absolute inset-0 bg-base/70 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              aria-label={i18n.t("Navigation")}
              className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-base-2 px-3 py-4"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%", transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="flex items-center justify-between px-3">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <Logo />
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={i18n.t("Close navigation")}
                  className="grid h-9 w-9 place-items-center rounded-md text-muted hover:text-text"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-6 flex-1">
                <SidebarNav layoutId="drawer-active" onNavigate={() => setMenuOpen(false)} />
              </div>
              <div className="mb-3 flex items-center gap-2">
                <LanguageSwitcher id="drawer-lang" />
                <ThemeToggle />
              </div>
              <SidebarScope />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <HydrationGate fallback={<div className="h-16 border-b border-line" />}>
          <Topbar onOpenMenu={() => setMenuOpen(true)} />
        </HydrationGate>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <HydrationGate>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </HydrationGate>
        </main>
      </div>
    </div>
  );
}
