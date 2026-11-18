"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useLanguage } from "@/i18n/use-language";

/** Counts up to a value, once, when it first appears or changes. */
export function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const i18n = useLanguage();
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      const id = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(id);
    }
    const controls = animate(0, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [value, reduce]);
  return (
    <span className="tabular-nums">
      {shown}
      {i18n.tx(suffix)}
    </span>
  );
}
