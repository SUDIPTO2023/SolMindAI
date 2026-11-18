"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/use-language";

/** Logo mark: four connected knowledge nodes, one per status colour, around a target node. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="solmind-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path d="M16 4 6 13l4 13h12l4-13Z" fill="none" stroke="url(#solmind-mark)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 13h20M16 4v12" stroke="url(#solmind-mark)" strokeWidth="1.2" opacity="0.6" />
      <circle cx="16" cy="4" r="2.4" fill="#8B5CF6" />
      <circle cx="6" cy="13" r="2.4" fill="#3B82F6" />
      <circle cx="26" cy="13" r="2.4" fill="#3B82F6" />
      <circle cx="10" cy="26" r="2.4" fill="#16A34A" />
      <circle cx="22" cy="26" r="2.4" fill="#F59E0B" />
      <circle cx="16" cy="16" r="3.4" fill="#22D3EE" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  const i18n = useLanguage();
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>{i18n.t("SOLMIND")}{" "}<span className="text-muted">{i18n.t("AI")}</span>
      </span>
    </span>
  );
}
