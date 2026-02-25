export interface Phase {
  id: number;
  slug: string;
  title: string;
  titleArabic: string;
  subtitle: string;
  description: string;
  estimatedWeeks: string;
  heroGradient: string;
  heroArabicWatermark: string;
}

export interface VocabItem {
  id: string;
  phaseId: number;
  arabic: string;
  transliteration: string;
  english: string;
  partOfSpeech?: "noun" | "verb" | "adj" | "phrase" | "expression" | "number" | "pronoun";
  audioFile?: string;
  category?: string;
  notes?: string;
  exampleSentence?: {
    arabic: string;
    transliteration: string;
    english: string;
  };
}

export interface DialogueLine {
  speaker: string;
  speakerRole: "a" | "b";
  arabic: string;
  transliteration: string;
  english: string;
  audioFile?: string;
}

export interface Dialogue {
  id: string;
  phaseId: number;
  title: string;
  context?: string;
  lines: DialogueLine[];
}

export interface SoundItem {
  letter: string;
  name: string;
  description: string;
  exampleArabic?: string;
  exampleTransliteration?: string;
  exampleEnglish?: string;
}

export interface GrammarRule {
  id: string;
  phaseId: number;
  title: string;
  tag?: string;
  explanation: string;
  examples?: {
    arabic: string;
    transliteration: string;
    english: string;
    breakdown?: string;
  }[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface CultureNote {
  id: string;
  phaseId: number;
  title: string;
  content: string;
  items?: {
    label: string;
    value: string;
    origin?: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  promptArabic?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface FillBlankQuestion {
  id: string;
  sentence: string;
  blank: string;
  answer: string;
  acceptableAnswers?: string[];
  hint?: string;
}

export interface MatchingPair {
  arabic: string;
  transliteration: string;
  english: string;
}

export interface ExerciseSet {
  id: string;
  phaseId: number;
  title: string;
  type: "multiple-choice" | "fill-blank" | "matching" | "sentence-builder" | "dictation";
  questions?: QuizQuestion[];
  fillBlanks?: FillBlankQuestion[];
  matchingPairs?: MatchingPair[];
  sentenceBuilderData?: {
    words: string[];
    correctOrder: number[];
    english: string;
  }[];
}

export interface ShadowingItem {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  audioFile?: string;
  steps: string[];
}

export interface PhrasePatternsGroup {
  id: string;
  phaseId: number;
  title: string;
  pattern: string;
  explanation: string;
  examples: {
    arabic: string;
    transliteration: string;
    english: string;
  }[];
}

export interface JournalPrompt {
  id: string;
  phaseId: number;
  arabic: string;
  transliteration: string;
  english: string;
  exampleResponse?: string;
}

export interface ProverbItem {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  meaning: string;
}

export interface ReadingPassage {
  id: string;
  phaseId: number;
  title: string;
  titleArabic: string;
  level: "beginner" | "intermediate" | "advanced";
  arabic: string;
  transliteration: string;
  english: string;
  vocabHighlights?: {
    arabic: string;
    transliteration: string;
    english: string;
  }[];
  comprehensionQuestions?: {
    question: string;
    answer: string;
  }[];
}

export interface LetterForm {
  letter: string;
  name: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

// ── v2.0 New Content Types ──

export interface ScenarioChoice {
  text: string;
  textArabic: string;
  textTransliteration: string;
  nextBranchId: string;
  culturalNote?: string;
}

export interface ScenarioBranch {
  id: string;
  speaker: string;
  speakerRole: "a" | "b" | "narrator";
  arabic: string;
  transliteration: string;
  english: string;
  choices?: ScenarioChoice[];
  culturalTip?: string;
}

export interface ScenarioLesson {
  id: string;
  phaseId: number;
  title: string;
  titleArabic: string;
  setting: string;
  branches: ScenarioBranch[];
  comprehensionCheck?: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  vocabSummary: {
    arabic: string;
    transliteration: string;
    english: string;
  }[];
}

export interface VerbConjugation {
  id: string;
  phaseId: number;
  verb: string;
  verbArabic: string;
  meaning: string;
  pastTense: {
    ana: string;
    enta: string;
    ente: string;
    huwwe: string;
    hiyye: string;
    ne7na: string;
    ento: string;
    henne: string;
  };
  presentTense: {
    ana: string;
    enta: string;
    ente: string;
    huwwe: string;
    hiyye: string;
    ne7na: string;
    ento: string;
    henne: string;
  };
  imperative?: {
    singular_m: string;
    singular_f: string;
    plural: string;
  };
  exampleSentences: {
    arabic: string;
    transliteration: string;
    english: string;
  }[];
}

export interface MSAComparison {
  id: string;
  phaseId: number;
  category: string;
  items: {
    concept: string;
    msa: { arabic: string; transliteration: string };
    lebanese: { arabic: string; transliteration: string };
    notes: string;
  }[];
}
