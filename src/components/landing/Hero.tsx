"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { Atom } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { StatusLegend } from "@/components/ui/StatusLegend";
import { HeroVisual } from "@/components/three/HeroVisual";
import { HERO_STORY } from "@/data/demo-scenarios";
import { DEMO_ENTRY_ROUTE } from "@/lib/constants";
import { DiagnosticInsightPanel } from "./DiagnosticInsightPanel";
import { useLanguage } from "@/i18n/use-language";

const STEP_MS = 2800;

export function Hero() {
  const i18n = useLanguage();
  const reduce = usePrefersReducedMotion();
  const [step, setStep] = useState(0);

  // Walk through the diagnostic story; the 3D network and the panel follow the same step.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % HERO_STORY.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const shown = reduce ? HERO_STORY.length - 1 : step;
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="relative overflow-hidden pt-16">
      {/* restrained ambient light, top right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[640px] w-[760px] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--c-glow-a), var(--c-glow-b), transparent)" }}
      />
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[1.02fr_1fr] lg:px-8 lg:py-10">
        <motion.div initial={reduce ? false : "hidden"} animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.p variants={item} className="text-xs font-semibold tracking-[0.18em] text-accent">{i18n.t("KNOWLEDGE-AWARE ADAPTIVE LEARNING")}</motion.p>
          <motion.h1 variants={item} className="mt-5 text-4xl font-semibold sm:text-5xl xl:text-[64px]">{i18n.t("Don’t Just Find the Right Answer.")}{" "}
            <span className="text-gradient">{i18n.t("Understand What You Missed.")}</span>
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted">{i18n.t("SOLMIND AI is designed to identify hidden learning gaps, investigate why students struggle, and guide every learner through personalized, prerequisite-aware learning experiences.")}</motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={DEMO_ENTRY_ROUTE} size="lg">{i18n.t("Explore the Learning Journey")}</ButtonLink>
            <ButtonLink href="#features" variant="secondary" size="lg">{i18n.t("Discover Core Features")}</ButtonLink>
          </motion.div>
          <motion.p variants={item} className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-ink/[0.03] px-3 py-1.5 text-sm text-muted">
            <Atom size={15} className="text-cyan-ink" aria-hidden="true" />{i18n.t("Starting with Class 11 Physics")}</motion.p>
        </motion.div>

        <div className="relative">
          <div className="relative h-[340px] sm:h-[420px] lg:h-[480px]">
            <HeroVisual status={HERO_STORY[shown].netForce} />
          </div>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="sm:w-[320px]">
              <DiagnosticInsightPanel step={shown} />
            </div>
            <StatusLegend className="sm:max-w-[220px] sm:justify-end" />
          </div>
        </div>
      </div>
    </section>
  );
}
