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
  reactivation: "#c0392b",
  "speaking-in-phrases": "#2980b9",
  "structured-conversation": "#8e44ad",
  "expanding-vocabulary": "#27ae60",
  "fluency-push": "#d35400",
  maintenance: "#16a085",
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
    { id: "tracing", label: "Letter Tracing" },
    { id: "vocab", label: "Core Vocabulary" },
    { id: "verbs", label: "Verb Conjugations" },
    { id: "grammar", label: "Grammar" },
    { id: "msa-comparison", label: "MSA vs Lebanese" },
    { id: "dialogues", label: "Dialogues" },
    { id: "shadowing", label: "Shadowing" },
    { id: "culture", label: "Culture" },
    { id: "chat", label: "AI Chat" },
    { id: "exercises", label: "Exercises" },
  ],
  "speaking-in-phrases": [
    { id: "shadowing", label: "Shadowing" },
    { id: "patterns", label: "Phrase Patterns" },
    { id: "vocab", label: "Vocab Drills" },
    { id: "verbs", label: "Verb Conjugations" },
    { id: "builder", label: "Sentence Builder" },
    { id: "scenarios", label: "Scenarios" },
    { id: "msa-comparison", label: "MSA vs Lebanese" },
    { id: "reading", label: "Reading Practice" },
    { id: "culture", label: "Culture" },
    { id: "chat", label: "AI Chat" },
    { id: "exercises", label: "Exercises" },
  ],
  "structured-conversation": [
    { id: "topics", label: "Topics" },
    { id: "journal", label: "Journaling" },
    { id: "connectors", label: "Connectors" },
    { id: "vocab", label: "Vocabulary" },
    { id: "verbs", label: "Verb Conjugations" },
    { id: "dialogues", label: "Dialogues" },
    { id: "scenarios", label: "Scenarios" },
    { id: "shadowing", label: "Shadowing" },
    { id: "reading", label: "Reading Practice" },
    { id: "idioms", label: "Idioms & Proverbs" },
    { id: "msa-comparison", label: "MSA vs Lebanese" },
    { id: "culture", label: "Culture" },
    { id: "chat", label: "AI Chat" },
    { id: "exercises", label: "Exercises" },
  ],
  "expanding-vocabulary": [
    { id: "wordbank", label: "Word Bank" },
    { id: "reading", label: "Reading Practice" },
    { id: "scenarios", label: "Scenarios" },
    { id: "idioms", label: "Idioms & Proverbs" },
    { id: "content", label: "Content Guide" },
    { id: "msa-comparison", label: "MSA vs Lebanese" },
    { id: "culture", label: "Culture" },
    { id: "chat", label: "AI Chat" },
    { id: "exercises", label: "Exercises" },
  ],
  "fluency-push": [
    { id: "dialogues", label: "Advanced Dialogues" },
    { id: "news", label: "News Reading" },
    { id: "writing", label: "Writing" },
    { id: "idioms", label: "Idioms & Proverbs" },
    { id: "msa-comparison", label: "MSA vs Lebanese" },
    { id: "culture", label: "Culture" },
    { id: "chat", label: "AI Chat" },
    { id: "exercises", label: "Exercises" },
  ],
  maintenance: [
    { id: "integrate", label: "Daily Integration" },
    { id: "reading", label: "Reading Practice" },
    { id: "proverbs", label: "Proverbs" },
    { id: "msa-comparison", label: "MSA vs Lebanese" },
    { id: "culture", label: "Cultural Depth" },
    { id: "assessment", label: "Assessment" },
    { id: "chat", label: "AI Chat" },
    { id: "resources", label: "Resources" },
  ],
};

/* ── Quick Access Launcher ── */

export interface LauncherActivity {
  id: string;
  label: string;
  phases: PhaseSlug[];
}

export interface LauncherCategory {
  id: string;
  label: string;
  icon: string;
  activities: LauncherActivity[];
}

export const LAUNCHER_CATEGORIES: LauncherCategory[] = [
  {
    id: "pronunciation",
    label: "Pronunciation & Listening",
    icon: "Volume2",
    activities: [
      { id: "sounds", label: "Sounds & Letters", phases: ["reactivation"] },
      { id: "minimal-pairs", label: "Minimal Pairs", phases: ["reactivation"] },
      { id: "shadowing", label: "Shadowing", phases: ["reactivation", "speaking-in-phrases", "structured-conversation"] },
      { id: "dialogues", label: "Dialogues", phases: ["reactivation", "structured-conversation", "fluency-push"] },
    ],
  },
  {
    id: "vocabulary",
    label: "Vocabulary & Reading",
    icon: "BookOpen",
    activities: [
      { id: "vocab", label: "Vocabulary", phases: ["reactivation", "speaking-in-phrases", "structured-conversation"] },
      { id: "wordbank", label: "Word Bank", phases: ["expanding-vocabulary"] },
      { id: "reading", label: "Reading Practice", phases: ["speaking-in-phrases", "structured-conversation", "expanding-vocabulary", "maintenance"] },
      { id: "news", label: "News Reading", phases: ["fluency-push"] },
      { id: "content", label: "Content Guide", phases: ["expanding-vocabulary"] },
    ],
  },
  {
    id: "grammar",
    label: "Grammar & Structure",
    icon: "PenLine",
    activities: [
      { id: "grammar", label: "Grammar", phases: ["reactivation"] },
      { id: "verbs", label: "Verb Conjugations", phases: ["reactivation", "speaking-in-phrases", "structured-conversation"] },
      { id: "patterns", label: "Phrase Patterns", phases: ["speaking-in-phrases"] },
      { id: "connectors", label: "Connectors", phases: ["structured-conversation"] },
      { id: "builder", label: "Sentence Builder", phases: ["speaking-in-phrases"] },
      { id: "msa-comparison", label: "MSA vs Lebanese", phases: ["reactivation", "speaking-in-phrases", "structured-conversation", "expanding-vocabulary", "fluency-push", "maintenance"] },
    ],
  },
  {
    id: "speaking",
    label: "Speaking & Conversation",
    icon: "MessageCircle",
    activities: [
      { id: "scenarios", label: "Scenarios", phases: ["speaking-in-phrases", "structured-conversation", "expanding-vocabulary"] },
      { id: "topics", label: "Topics", phases: ["structured-conversation"] },
      { id: "journal", label: "Journaling", phases: ["structured-conversation"] },
      { id: "writing", label: "Writing", phases: ["fluency-push"] },
    ],
  },
  {
    id: "culture",
    label: "Culture & Expressions",
    icon: "Globe",
    activities: [
      { id: "culture", label: "Culture", phases: ["reactivation", "speaking-in-phrases", "structured-conversation", "expanding-vocabulary", "fluency-push", "maintenance"] },
      { id: "idioms", label: "Idioms & Proverbs", phases: ["structured-conversation", "expanding-vocabulary", "fluency-push"] },
      { id: "proverbs", label: "Proverbs", phases: ["maintenance"] },
    ],
  },
  {
    id: "practice",
    label: "Practice & Assessment",
    icon: "Target",
    activities: [
      { id: "exercises", label: "Exercises", phases: ["reactivation", "speaking-in-phrases", "structured-conversation", "expanding-vocabulary", "fluency-push"] },
      { id: "tracing", label: "Letter Tracing", phases: ["reactivation"] },
      { id: "assessment", label: "Assessment", phases: ["maintenance"] },
      { id: "integrate", label: "Daily Integration", phases: ["maintenance"] },
      { id: "resources", label: "Resources", phases: ["maintenance"] },
    ],
  },
];
