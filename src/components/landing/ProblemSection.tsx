"use client";

import { Calculator, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Formula } from "@/components/ui/Formula";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MAIN_DIAGNOSTIC } from "@/data/questions";
import { useLanguage } from "@/i18n/use-language";

const CASES = [
  {
    icon: Lightbulb,
    tone: "error" as const,
    label: "Conceptual gap",
    working: String.raw`a = \dfrac{30}{5} = 6`,
    what: "The student does not understand how opposing forces contribute to net force.",
    help: "Needs the idea rebuilt: which forces act, and how they combine.",
  },
  {
    icon: Calculator,
    tone: "warning" as const,
    label: "Mathematical gap",
    working: String.raw`a = \dfrac{30 - 10}{5} = 5`,
    what: "The student understands the physics concept but makes an error in the calculation process.",
    help: "Needs the method confirmed and one step corrected, not a new lesson.",
  },
];

export function ProblemSection() {
  const i18n = useLanguage();
  return (
    <section className="border-t border-line bg-base-2">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal>
          <SectionHeading
            kicker="The learning problem"
            title="A Wrong Answer Doesn’t Explain Why It Happened."
            lead="A marking scheme sees two wrong answers. A teacher sees two different students. SOLMIND AI is built to see the difference too."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1fr_1fr]">
          <div className="panel p-6">
            <p className="text-sm text-muted">{i18n.t("Same question for both")}</p>
            <p className="mt-3 text-lg leading-relaxed">{i18n.tx(MAIN_DIAGNOSTIC.prompt)}</p>
            <div className="mt-5 border-t border-line pt-4 text-sm text-muted">{i18n.t("Correct answer")}<div className="mt-2 text-lg text-text">
                <Formula tex={String.raw`a = \dfrac{30 - 10}{5} = 4\ \text{m/s}^2`} />
              </div>
            </div>
          </div>

          {CASES.map((c) => (
            <article key={c.label} className="panel flex flex-col p-6">
              <div className="flex items-center justify-between">
                <Badge tone={c.tone}>
                  <c.icon size={13} aria-hidden="true" />
                  {i18n.tx(c.label)}
                </Badge>
                <span className="font-mono text-xs text-muted">{i18n.t("wrong answer")}</span>
              </div>
              <div className="mt-6 rounded-md border border-line bg-base/60 px-4 py-5 text-xl">
                <Formula tex={c.working} display />
              </div>
              <p className="mt-5">{i18n.tx(c.what)}</p>
              <p className="mt-auto pt-5 text-sm text-muted">
                <span className="font-medium text-text">{i18n.t("What helps:")}{" "}</span>
                {i18n.tx(c.help)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
