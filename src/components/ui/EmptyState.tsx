"use client";

import type { LucideIcon } from "lucide-react";
import { Badge } from "./Badge";
import { useLanguage } from "@/i18n/use-language";

/** Explains what will appear in an area and what to do now. Never a dead end. */
export function EmptyState({
  icon: Icon,
  badge,
  title,
  body,
  points,
  children,
}: {
  icon: LucideIcon;
  badge?: string;
  title: string;
  body: string;
  points?: string[];
  children?: React.ReactNode;
}) {
  const i18n = useLanguage();
  return (
    <section className="panel bg-grid relative overflow-hidden px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-purple/40 bg-base text-accent-soft">
          <Icon size={22} aria-hidden="true" />
        </span>
        {badge && <Badge tone="purple" className="mt-5">{i18n.tx(badge)}</Badge>}
        <h2 className="mt-4 text-2xl font-semibold">{i18n.tx(title)}</h2>
        <p className="mt-3 text-muted">{i18n.tx(body)}</p>
        {points && (
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm">
            {points.map((p) => (
              <li key={p} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple" aria-hidden="true" />
                <span className="text-muted">{i18n.tx(p)}</span>
              </li>
            ))}
          </ul>
        )}
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
