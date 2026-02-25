export const PHASE_SLUGS = [
  "reactivation",
  "speaking-in-phrases",
  "structured-conversation",
  "expanding-vocabulary",
  "fluency-push",
  "maintenance",
] as const;

export type PhaseSlug = (typeof PHASE_SLUGS)[number];

export const PHASE_COLORS: Record<PhaseSlug, string> = {
  reactivation: "#8B1A1A",
  "speaking-in-phrases": "#1a3a5c",
  "structured-conversation": "#4a1a6b",
  "expanding-vocabulary": "#1b4332",
  "fluency-push": "#7d3000",
  maintenance: "#0d5050",
};

export const PHASE_TITLES: Record<PhaseSlug, { en: string; ar: string; subtitle: string }> = {
  reactivation: {
    en: "Reactivation",
    ar: "أهلا من جديد",
    subtitle: "Welcome Back",
  },
  "speaking-in-phrases": {
    en: "Speaking in Phrases",
    ar: "عم نحكي",
    subtitle: "We're Speaking Now",
  },
  "structured-conversation": {
    en: "Structured Conversation",
    ar: "محادثة",
    subtitle: "Real Conversations",
  },
  "expanding-vocabulary": {
    en: "Expanding Vocabulary",
    ar: "كلمات جديدة",
    subtitle: "New Words",
  },
  "fluency-push": {
    en: "Fluency Push",
    ar: "طلاقة",
    subtitle: "Becoming Fluent",
  },
  maintenance: {
    en: "Maintenance",
    ar: "استمرارية",
    subtitle: "Keep It Alive",
  },
};

export const PHASE_TABS: Record<PhaseSlug, { id: string; label: string }[]> = {
  reactivation: [
    { id: "sounds", label: "Sounds & Letters" },
    { id: "minimal-pairs", label: "Minimal Pairs" },
    { id: "vocab", label: "Core Vocabulary" },
    { id: "grammar", label: "Grammar" },
    { id: "dialogues", label: "Dialogues" },
    { id: "culture", label: "Culture" },
    { id: "exercises", label: "Exercises" },
  ],
  "speaking-in-phrases": [
    { id: "shadowing", label: "Shadowing" },
    { id: "patterns", label: "Phrase Patterns" },
    { id: "vocab", label: "Vocab Drills" },
    { id: "builder", label: "Sentence Builder" },
    { id: "exercises", label: "Exercises" },
  ],
  "structured-conversation": [
    { id: "topics", label: "Topics" },
    { id: "journal", label: "Journaling" },
    { id: "connectors", label: "Connectors" },
    { id: "vocab", label: "Vocabulary" },
    { id: "dialogues", label: "Dialogues" },
    { id: "exercises", label: "Exercises" },
  ],
  "expanding-vocabulary": [
    { id: "wordbank", label: "Word Bank" },
    { id: "reading", label: "Reading Practice" },
    { id: "content", label: "Content Guide" },
    { id: "exercises", label: "Exercises" },
  ],
  "fluency-push": [
    { id: "dialogues", label: "Advanced Dialogues" },
    { id: "news", label: "News Reading" },
    { id: "writing", label: "Writing" },
    { id: "idioms", label: "Idioms & Proverbs" },
    { id: "exercises", label: "Exercises" },
  ],
  maintenance: [
    { id: "integrate", label: "Daily Integration" },
    { id: "proverbs", label: "Proverbs" },
    { id: "culture", label: "Cultural Depth" },
    { id: "assessment", label: "Assessment" },
    { id: "resources", label: "Resources" },
  ],
};
