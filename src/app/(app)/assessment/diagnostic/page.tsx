import type { Metadata } from "next";
import { DiagnosticAssessment } from "@/components/assessment/DiagnosticAssessment";

export const metadata: Metadata = { title: "Diagnostic Assessment" };

// Page 04: Diagnostic Assessment.
export default function DiagnosticPage() {
  return <DiagnosticAssessment />;
}
