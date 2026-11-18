"use client";

import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useLearningStore } from "@/store/learning-store";
import { useLanguage } from "@/i18n/use-language";

/** Confirms before wiping the demo back to its starting point. */
export function ResetDemoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const i18n = useLanguage();
  const router = useRouter();
  const resetDemo = useLearningStore((s) => s.resetDemo);

  const confirm = () => {
    resetDemo();
    onClose();
    router.push("/onboarding");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reset the demo?"
      description="Your learning mode, answers and progress go back to the starting sample profile. Use this before recording a fresh walkthrough."
    >
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} data-autofocus>{i18n.t("Keep my progress")}</Button>
        <Button onClick={confirm}>{i18n.t("Reset demo")}</Button>
      </div>
    </Dialog>
  );
}
