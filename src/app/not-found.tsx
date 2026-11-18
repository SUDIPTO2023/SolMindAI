"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/use-language";

// Shown for any address that does not match one of the seven demo pages.
export default function NotFound() {
  const i18n = useLanguage();
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <h1 className="mt-8 text-3xl font-semibold">{i18n.t("This page doesn’t exist")}</h1>
        <p className="mt-3 text-muted">{i18n.t("The link may be mistyped. Your learning progress is safe.")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className={buttonClass({ size: "lg" })}>{i18n.t("Go to the dashboard")}</Link>
          <Link href="/" className={buttonClass({ size: "lg", variant: "secondary" })}>{i18n.t("Home page")}</Link>
        </div>
      </div>
    </main>
  );
}
