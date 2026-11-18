"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { DEMO_ENTRY_ROUTE, LANDING_NAV } from "@/lib/constants";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

export function SiteHeader() {
  const i18n = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-b border-line bg-base/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="SOLMIND AI home">
          <Logo />
        </Link>

        <nav aria-label={i18n.t("Main")} className="hidden items-center gap-1 md:flex">
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-ink/[0.04] hover:text-text"
            >
              {i18n.tx(item.label)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden md:block">
            <LanguageSwitcher id="site-lang" />
          </span>
          <span className="hidden md:block">
            <ThemeToggle />
          </span>
          <span className="hidden sm:block">
            <ButtonLink href={DEMO_ENTRY_ROUTE}>{i18n.t("Explore Demo")}</ButtonLink>
          </span>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-line text-muted hover:text-text md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={i18n.tx(open ? "Close menu" : "Open menu")}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label={i18n.t("Mobile")}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              <div className="mb-2 flex items-center gap-2">
                <LanguageSwitcher id="mobile-lang" />
                <ThemeToggle />
              </div>
              {LANDING_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-text hover:bg-ink/[0.04]"
                >
                  {i18n.tx(item.label)}
                </a>
              ))}
              <ButtonLink href={DEMO_ENTRY_ROUTE} className="mt-2">{i18n.t("Explore Demo")}</ButtonLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
