"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { DEMO_ENTRY_ROUTE } from "@/lib/constants";
import { useLanguage } from "@/i18n/use-language";

export function FinalCta() {
  const i18n = useLanguage();
  return (
    <section className="relative overflow-hidden border-t border-line">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--c-glow-a), transparent)" }}
      />
      <Reveal className="relative mx-auto max-w-3xl px-5 py-28 text-center">
        <h2 className="text-4xl font-semibold sm:text-5xl">{i18n.t("Understand the Gap.")}{" "}<span className="text-gradient">{i18n.t("Master the Concept.")}</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{i18n.t("Follow one student from a wrong answer, through a guided lesson, to a stronger topic. No account needed.")}</p>
        <ButtonLink href={DEMO_ENTRY_ROUTE} size="lg" className="mt-9">{i18n.t("Explore the Learning Experience")}</ButtonLink>
      </Reveal>
    </section>
  );
}
