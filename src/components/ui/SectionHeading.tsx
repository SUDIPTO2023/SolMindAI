"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

export function SectionHeading({
  kicker,
  title,
  lead,
  align = "left",
  className,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const i18n = useLanguage();
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {kicker && <p className="text-sm font-medium text-accent">{i18n.tx(kicker)}</p>}
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl md:text-[44px]">{i18n.tx(title)}</h2>
      {lead && <p className="mt-4 text-lg text-muted">{i18n.tx(lead)}</p>}
    </div>
  );
}
