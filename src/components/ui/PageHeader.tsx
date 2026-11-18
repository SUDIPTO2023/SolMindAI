"use client";

import { useLanguage } from "@/i18n/use-language";
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  const i18n = useLanguage();
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">{i18n.tx(title)}</h1>
        {description && <p className="mt-2 text-muted">{i18n.tx(description)}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
