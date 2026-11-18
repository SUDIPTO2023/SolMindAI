import type { Metadata } from "next";
import { TutorWorkspace } from "@/components/tutor/TutorWorkspace";

export const metadata: Metadata = { title: "AI Tutor" };

// Page 05: AI Tutor Workspace.
export default function TutorPage() {
  return <TutorWorkspace />;
}
