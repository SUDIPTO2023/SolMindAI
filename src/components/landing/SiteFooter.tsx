"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { DEMO_ENTRY_ROUTE, LANDING_NAV } from "@/lib/constants";
import { useLanguage } from "@/i18n/use-language";

const TEAM = [
  "Full-stack lead and technical architect",
  "Full-stack and AI engineer",
  "Frontend and UI/UX engineer",
  "Physics content, dataset, QA and documentation lead",
];

export function SiteFooter() {
  const i18n = useLanguage();
  return (
    <footer id="about" className="border-t border-line bg-base-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm text-muted">{i18n.t("SOLMIND AI is an adaptive tutoring platform that finds hidden learning gaps, separates conceptual from mathematical difficulties, and guides each student through prerequisite-aware learning.")}</p>
          <p className="mt-4 max-w-md rounded-md border border-line bg-base/50 p-3 text-xs text-muted">{i18n.t("This is an interactive frontend prototype. Diagnosis, tutoring and progress use scripted, rule-based simulation with sample data. AI models and curriculum retrieval are built in the next phase.")}</p>
        </div>
        <div>
          <p className="text-sm font-medium">{i18n.t("Explore")}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {LANDING_NAV.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-text">{i18n.tx(l.label)}</a>
              </li>
            ))}
            <li>
              <Link href={DEMO_ENTRY_ROUTE} className="hover:text-text">{i18n.t("Explore Demo")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">{i18n.t("About the team")}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {TEAM.map((t) => <li key={t}>{i18n.tx(t)}</li>)}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-muted lg:px-8">{i18n.t("© 2026 SOLMIND AI. Class 11 Physics: Newton’s Laws of Motion.")}</p>
      </div>
    </footer>
  );
}
