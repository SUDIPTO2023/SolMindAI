export const LANGUAGES = [
  { id: "en", label: "English", short: "EN" },
  { id: "bn", label: "বাংলা", short: "বাং" },
] as const;

export type Language = (typeof LANGUAGES)[number]["id"];

/** English stays the default for first-time visitors. */
export const DEFAULT_LANGUAGE: Language = "en";

/** localStorage key. Kept apart from the learning record, so switching never touches progress. */
export const LANGUAGE_STORAGE_KEY = "solmind-language";
