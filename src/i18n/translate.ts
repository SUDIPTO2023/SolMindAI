// Pure translation helpers. English source text is the key, so the English
// experience is always exactly the original copy: in English, every function
// here returns its input unchanged.

import { BN_MESSAGES, type MessageKey } from "./dictionaries/bn";
import { BN_PATTERNS } from "./dictionaries/bn-patterns";
import type { Language } from "./config";

const exact = BN_MESSAGES as Record<string, string>;

function fill(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Translates one whole string: exact entry first, then the patterns for generated text. */
function translateWhole(text: string): string | null {
  if (text in exact) return exact[text];
  for (const [re, to] of BN_PATTERNS) {
    const m = text.match(re);
    if (m) return typeof to === "function" ? to(m, (s) => translateText(s, "bn")) : text.replace(re, to);
  }
  return null;
}

/**
 * Translates free text, including text generated at run time with numbers in it.
 * Whole string first; otherwise sentence by sentence; otherwise the original.
 */
export function translateText(text: string, lang: Language): string {
  if (lang === "en" || !text.trim()) return text;
  const lead = text.match(/^\s*/)![0];
  const trail = text.match(/\s*$/)![0];
  const core = text.trim();
  if (!/[A-Za-z]/.test(core)) return text; // numbers, units and symbols only
  const whole = translateWhole(core);
  if (whole !== null) return lead + whole + trail;

  // Several sentences generated together: translate each one.
  const parts = core.split(/(?<=[.!?”])\s+(?=[A-Z0-9“])/);
  if (parts.length > 1) {
    const done = parts.map((p) => translateWhole(p));
    if (done.every((d) => d !== null)) return lead + done.join(" ") + trail;
  }
  if (process.env.NODE_ENV !== "production") console.warn(`[i18n] No Bangla for: ${core}`);
  return text;
}

/** Typed lookup for fixed interface text. A key without a Bangla entry fails the type check. */
export function translateKey(key: MessageKey, lang: Language, vars?: Record<string, string | number>) {
  return fill(lang === "en" ? key : (exact[key] ?? key), vars);
}
