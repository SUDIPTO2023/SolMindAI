"use client";

import Link from "next/link";
import { HydrationGate } from "@/components/layout/HydrationGate";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { NetworkFallback } from "@/components/three/NetworkFallback";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { useLanguage } from "@/i18n/use-language";


/** Page 02 body: full screen, outside the app shell. Client side for the language switcher. */
export function OnboardingScreen() {
  const i18n = useLanguage();
  return (
    <div className="grid min-h-screen lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr]">
      <aside className="relative hidden flex-col overflow-hidden border-r border-line bg-base-2 p-10 lg:flex">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <Link href="/" className="relative" aria-label="SOLMIND AI home">
          <Logo />
        </Link>
        <div className="relative mt-auto">
          <div className="mx-auto h-64 w-full max-w-sm opacity-90">
            <NetworkFallback animatedStatus="not_assessed" />
          </div>
          <p className="mt-8 text-2xl font-semibold leading-snug">{i18n.t("Every topic you learn builds on others. SOLMIND checks those foundations first.")}</p>
          <p className="mt-3 text-sm text-muted">{i18n.t("Class 11 Physics: Newton’s Laws of Motion")}</p>
        </div>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10 lg:px-16 lg:py-12">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden" aria-label="SOLMIND AI home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher id="onboarding-lang" />
            <ThemeToggle size="sm" />
            <Badge tone="cyan">{i18n.t("Guest demo profile")}</Badge>
          </div>
        </div>
        <div className="mx-auto mt-10 w-full max-w-2xl flex-1">
          <HydrationGate>
            <OnboardingFlow />
          </HydrationGate>
        </div>
      </main>
    </div>
  );
}
