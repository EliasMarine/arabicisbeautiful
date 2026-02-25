/**
 * Placement test: 15 questions, 3 per phase (Phases 1-5).
 * Phase 6 (Maintenance) is excluded — you wouldn't place into it.
 */

export interface PlacementQuestion {
  id: string;
  phaseId: number;
  prompt: string;
  promptArabic?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const placementQuestions: PlacementQuestion[] = [
  // ── Phase 1: Reactivation (basic greetings, letters, numbers) ──
  {
    id: "p1-q1",
    phaseId: 1,
    prompt: "What does 'مرحبا' mean?",
    promptArabic: "مرحبا",
    options: ["Thank you", "Hello", "Goodbye", "Please"],
    correctIndex: 1,
    explanation: "'مرحبا' (marḥaba) is the most common way to say 'hello' in Lebanese Arabic.",
  },
  {
    id: "p1-q2",
    phaseId: 1,
    prompt: "How do you say 'thank you' in Lebanese Arabic?",
    options: ["مرحبا", "شكراً", "كيفك", "يلّا"],
    correctIndex: 1,
    explanation: "'شكراً' (shukran) means 'thank you'.",
  },
  {
    id: "p1-q3",
    phaseId: 1,
    prompt: "What number is 'تلاتة'?",
    promptArabic: "تلاتة",
    options: ["2", "3", "4", "5"],
    correctIndex: 1,
    explanation: "'تلاتة' (tlaate) means 3. Note the Lebanese pronunciation differs from MSA 'ثلاثة'.",
  },

  // ── Phase 2: Speaking in Phrases (verb patterns, basic sentences) ──
  {
    id: "p2-q1",
    phaseId: 2,
    prompt: "Complete the sentence: 'بدّي ___ ' (I want to eat)",
    promptArabic: "بدّي ___",
    options: ["آكل", "أروح", "أحكي", "أنام"],
    correctIndex: 0,
    explanation: "'بدّي آكل' (badde ekol) means 'I want to eat'. 'بدّي' is the Lebanese way to express wanting.",
  },
  {
    id: "p2-q2",
    phaseId: 2,
    prompt: "What does 'عم بحكي' mean?",
    promptArabic: "عم بحكي",
    options: ["I was talking", "I will talk", "I am talking", "I talked"],
    correctIndex: 2,
    explanation: "'عم' (3am) + present tense = ongoing action. 'عم بحكي' = 'I am talking (right now)'.",
  },
  {
    id: "p2-q3",
    phaseId: 2,
    prompt: "How do you say 'I went to the market' in Lebanese?",
    options: ["رحت عالسوق", "بدّي روح عالسوق", "عم بروح عالسوق", "بروح عالسوق"],
    correctIndex: 0,
    explanation: "'رحت عالسوق' (reḥet 3al-souq) uses the past tense 'رحت' (I went) + 'عالسوق' (to the market).",
  },

  // ── Phase 3: Structured Conversation (connectors, topic vocab) ──
  {
    id: "p3-q1",
    phaseId: 3,
    prompt: "Which connector means 'because'?",
    options: ["بس", "لأنو", "يعني", "هيك"],
    correctIndex: 1,
    explanation: "'لأنو' (la2enno) means 'because'. It's one of the most important connectors for fluent speech.",
  },
  {
    id: "p3-q2",
    phaseId: 3,
    prompt: "What does 'شو رأيك؟' mean?",
    promptArabic: "شو رأيك؟",
    options: ["What's your name?", "What's your opinion?", "Where are you from?", "How old are you?"],
    correctIndex: 1,
    explanation: "'شو رأيك' (shu ra2yak) literally means 'what's your opinion?' — used constantly in Lebanese conversation.",
  },
  {
    id: "p3-q3",
    phaseId: 3,
    prompt: "Complete: 'ما بعرف ___ ما سألت' (I don't know because I didn't ask)",
    options: ["بس", "لأنو", "يعني", "كمان"],
    correctIndex: 1,
    explanation: "'لأنو' connects the two clauses: 'I don't know' + 'because' + 'I didn't ask'.",
  },

  // ── Phase 4: Expanding Vocabulary (word families, intermediate reading) ──
  {
    id: "p4-q1",
    phaseId: 4,
    prompt: "The root ك-ت-ب relates to writing. Which word means 'library'?",
    options: ["كتاب", "مكتبة", "كاتب", "مكتوب"],
    correctIndex: 1,
    explanation: "'مكتبة' (maktabe) means 'library/bookstore'. All these words share the root ك-ت-ب (k-t-b): كتاب (book), كاتب (writer), مكتوب (written).",
  },
  {
    id: "p4-q2",
    phaseId: 4,
    prompt: "What does 'عندي مشكلة بسيارتي' mean?",
    promptArabic: "عندي مشكلة بسيارتي",
    options: [
      "I have a problem with my car",
      "I want to buy a car",
      "My car is beautiful",
      "I don't have a car",
    ],
    correctIndex: 0,
    explanation: "'عندي' (3ande) = I have, 'مشكلة' (meshkle) = problem, 'بسيارتي' (b-sayyarte) = with my car.",
  },
  {
    id: "p4-q3",
    phaseId: 4,
    prompt: "Which sentence correctly uses 'لازم' (must/should)?",
    options: [
      "لازم تدرس للامتحان",
      "بدّي لازم تدرس",
      "عم لازم تدرس",
      "لازم عم تدرس",
    ],
    correctIndex: 0,
    explanation: "'لازم' (laazem) + present tense verb = 'must/should'. 'لازم تدرس للامتحان' = 'You must study for the exam'.",
  },

  // ── Phase 5: Fluency Push (idioms, advanced grammar, cultural nuance) ──
  {
    id: "p5-q1",
    phaseId: 5,
    prompt: "What does the idiom 'بعد ما شاب دقّولو الكتاب' mean?",
    options: [
      "After he got old, they brought him the book",
      "Better late than never, but ironically",
      "He reads a lot of books",
      "Knowledge comes with age",
    ],
    correctIndex: 1,
    explanation: "This idiom literally means 'After he got old, they gave him the schoolbook' — used sarcastically when something comes too late.",
  },
  {
    id: "p5-q2",
    phaseId: 5,
    prompt: "In the sentence 'لو كنت بعرف، كنت خبّرتك', what tense/mood is this?",
    promptArabic: "لو كنت بعرف، كنت خبّرتك",
    options: ["Past simple", "Future conditional", "Unreal conditional (past)", "Present continuous"],
    correctIndex: 2,
    explanation: "'لو كنت...' is the unreal/contrary-to-fact conditional: 'If I had known, I would have told you.' It expresses something that didn't happen.",
  },
  {
    id: "p5-q3",
    phaseId: 5,
    prompt: "What is the appropriate response to 'تقبرني' (te2berne)?",
    options: [
      "It's an insult — don't respond",
      "It's a term of endearment — respond warmly",
      "It means 'excuse me' — say 'عفواً'",
      "It means 'help me' — offer assistance",
    ],
    correctIndex: 1,
    explanation: "'تقبرني' literally means 'bury me' but is one of the most affectionate expressions in Lebanese Arabic. It means 'I love you so much I'd die before you.'",
  },
];

/**
 * Score the placement test and recommend a phase.
 * Returns the highest phase where the user scored ≥2/3.
 * Falls back to Phase 1 if they scored <2/3 on Phase 1 questions.
 */
export function scorePlacementTest(answers: Record<string, number>): {
  recommendedPhase: number;
  phaseScores: { phaseId: number; correct: number; total: number }[];
} {
  const phaseScores: { phaseId: number; correct: number; total: number }[] = [];

  for (let phase = 1; phase <= 5; phase++) {
    const phaseQuestions = placementQuestions.filter((q) => q.phaseId === phase);
    let correct = 0;
    for (const q of phaseQuestions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    phaseScores.push({ phaseId: phase, correct, total: phaseQuestions.length });
  }

  // Find highest phase where user scored ≥ 2/3
  let recommendedPhase = 1;
  for (const ps of phaseScores) {
    if (ps.correct >= 2) {
      recommendedPhase = ps.phaseId + 1; // They passed this phase, recommend next
    } else {
      break; // Stop at first phase they didn't pass
    }
  }

  // Cap at phase 5 (can't skip to phase 6)
  recommendedPhase = Math.min(recommendedPhase, 5);

  return { recommendedPhase, phaseScores };
}
