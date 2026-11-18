"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, RotateCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { modeById } from "@/data/onboarding";
import { navItemFor } from "@/lib/navigation";
import { useLearningStore } from "@/store/learning-store";
import { ResetDemoDialog } from "./ResetDemoDialog";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { SearchDialog } from "./SearchDialog";
import { useLanguage } from "@/i18n/use-language";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const i18n = useLanguage();
  const pathname = usePathname();
  const item = navItemFor(pathname);
  const name = useLearningStore((s) => s.profile.name);
  const mode = modeById(useLearningStore((s) => s.learningMode));
  const [searchOpen, setSearchOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  // Ctrl+K / Cmd+K opens search from anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label={i18n.t("Open navigation")}
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-muted hover:text-text lg:hidden"
          >
            <Menu size={18} />
          </button>

          <nav aria-label={i18n.t("Breadcrumb")} className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-sm">
              <li className="hidden text-muted sm:block">{i18n.tx(item?.section ?? "SOLMIND AI")}</li>
              <li className="hidden text-muted sm:block" aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li className="truncate font-medium" aria-current="page">{i18n.tx(item?.label ?? "Page")}</li>
            </ol>
          </nav>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-10 w-72 items-center gap-2 whitespace-nowrap rounded-md border border-line bg-ink/[0.02] px-3 text-sm text-muted hover:border-line-strong xl:flex"
          >
            <Search size={15} aria-hidden="true" />
            <span className="flex-1 text-left">{i18n.t("Search topics and pages")}</span>
            <kbd className="rounded border border-line px-1.5 font-mono text-[11px]">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={i18n.t("Search topics and pages")}
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-muted hover:text-text xl:hidden"
          >
            <Search size={17} />
          </button>

          <span className="hidden md:block">
            <Badge tone="cyan">{i18n.t("Demo mode")}</Badge>
          </span>

          <LanguageSwitcher compact id="topbar-lang" />
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm text-muted hover:border-line-strong hover:text-text"
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span className="hidden sm:inline">{i18n.t("Reset demo")}</span>
            <span className="sr-only sm:hidden">{i18n.t("Reset demo")}</span>
          </button>

          <Link
            href="/onboarding"
            className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 hover:bg-ink/[0.04]"
            title="Change learning mode"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-primary)] text-sm font-semibold text-white">
              {i18n.tx(initials(name))}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium">{i18n.tx(name)}</span>
              <span className="block text-xs text-muted">{i18n.tx(mode?.title ?? "No mode chosen")}</span>
            </span>
          </Link>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ResetDemoDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </>
  );
}
