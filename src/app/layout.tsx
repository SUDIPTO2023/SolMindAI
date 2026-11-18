import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "katex/dist/katex.min.css";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "./globals.css";
import { LanguageProvider } from "@/i18n/language-provider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { THEME_BOOT_SCRIPT } from "@/theme/theme-store";

export const metadata: Metadata = {
  title: { default: "SOLMIND AI | Understand what you missed", template: "%s | SOLMIND AI" },
  description:
    "SOLMIND AI is an adaptive tutoring platform that finds hidden learning gaps and guides each student through prerequisite-aware learning. Starting with Class 11 Physics.",
};

export const viewport: Viewport = {
  themeColor: "#080B16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
