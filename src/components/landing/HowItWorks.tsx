"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { Compass, ScanSearch, Shuffle, Stethoscope } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/use-language";

const STAGES = [
  { icon: Stethoscope, title: "Diagnose", body: "Check prerequisite readiness, then collect the answer, the working and the unit." },
  { icon: ScanSearch, title: "Identify", body: "Separate conceptual from mathematical gaps, and ask a follow-up before confirming anything." },
  { icon: Compass, title: "Guide", body: "Teach through Socratic questions and staged hints, starting from zero when the foundation is missing." },
  { icon: Shuffle, title: "Adapt", body: "Choose the next question from the evidence, then update the knowledge map and analytics." },
];

export function HowItWorks() {
  const i18n = useLanguage();
  const reduce = usePrefersReducedMotion();
  return (
    <section id="how-it-works" className="border-t border-line bg-base-2">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <SectionHeading kicker="How it works" title="From one answer to the right next step" />
        </Reveal>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          {/* the connecting line draws itself once, when the section comes into view */}
          <motion.span
            aria-hidden="true"
            className="absolute left-6 right-6 top-6 hidden h-px origin-left bg-[image:var(--gradient-primary)] md:block"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          {STAGES.map((s, i) => (
            <motion.li
              key={s.title}
              className="relative"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ delay: 0.25 + i * 0.25, duration: 0.5 }}
            >
              <span className="relative grid h-12 w-12 place-items-center rounded-full border border-purple/40 bg-base text-accent-soft">
                <s.icon size={20} aria-hidden="true" />
              </span>
              <p className="mt-5 font-mono text-xs text-muted">{i18n.t("Stage")}{" "}{i + 1}</p>
              <h3 className="mt-1 text-xl font-semibold">{i18n.tx(s.title)}</h3>
              <p className="mt-2 text-muted">{i18n.tx(s.body)}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
