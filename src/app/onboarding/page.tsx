import type { Metadata } from "next";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";

export const metadata: Metadata = { title: "Get started" };

// Page 02: Student Onboarding. Full screen, outside the app shell.
export default function OnboardingPage() {
  return <OnboardingScreen />;
}
