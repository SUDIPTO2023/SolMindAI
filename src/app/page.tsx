import { FinalCta } from "@/components/landing/FinalCta";
import { GapPreview } from "@/components/landing/GapPreview";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { InnovationSection } from "@/components/landing/InnovationSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ScopeSection } from "@/components/landing/ScopeSection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

// Page 01: Landing. A Server Component that composes the sections;
// interactive sections are Client Components of their own.
export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProblemSection />
        <InnovationSection />
        <HowItWorks />
        <GapPreview />
        <ScopeSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
