import { BN_CONTENT } from "./bn-content";
import { BN_UI } from "./bn-ui";

/** Every Bangla string, keyed by its exact English source text. */
export const BN_MESSAGES: Record<string, string> = { ...BN_CONTENT, ...BN_UI };

/** Keys accepted by t(). Using an English string that has no Bangla entry fails the type check. */
export type MessageKey = keyof typeof BN_UI | MessageTemplate;

/** Sentences with {placeholders}, for text whose word order differs between the two languages. */
export const BN_TEMPLATES = {
  "{n} piece of evidence": "{n}টি প্রমাণ",
  "{n} pieces of evidence": "{n}টি প্রমাণ",
  "{n} topic": "{n}টি বিষয়",
  "{n} topics": "{n}টি বিষয়",
  "The demo map uses {used} of these. Prerequisite links are pending review by the team’s Physics content lead.":
    "এর মধ্যে {used}টি ডেমো ম্যাপে ব্যবহার হয়েছে। পূর্বশর্তের সংযোগগুলো দলের পদার্থবিজ্ঞান কনটেন্ট লিডের পর্যালোচনার অপেক্ষায়।",
} as const;
export type MessageTemplate = keyof typeof BN_TEMPLATES;
Object.assign(BN_MESSAGES, BN_TEMPLATES);
