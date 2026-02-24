import type { ExerciseSet } from "../types";

export const phase6Exercises: ExerciseSet[] = [
  {
    id: "p6-quiz",
    phaseId: 6,
    title: "Phase 6 Assessment — Maintenance & Naturalness",
    type: "multiple-choice",
    questions: [
      {
        id: "p6-q1",
        prompt: "الغايب حجتو معو means:",
        options: [
          "The absent are forgotten",
          "The absent have their excuse — don't judge those not present",
          "Out of sight, out of mind",
        ],
        correctIndex: 1,
        explanation:
          "This Lebanese proverb means the absent person has their own reasons — you shouldn't judge someone who isn't there to defend themselves. It promotes fairness, unlike 'out of sight, out of mind' which implies forgetting.",
      },
      {
        id: "p6-q2",
        prompt: "إيد وحدة ما بتصفق means:",
        options: [
          "Help yourself",
          "Work alone",
          "One hand doesn't clap — both sides share responsibility",
        ],
        correctIndex: 2,
        explanation:
          "إيد وحدة ما بتصفق (īd waḥde ma bitsaffi') literally means 'one hand doesn't clap' — a Lebanese proverb emphasizing that cooperation and shared responsibility are needed, not just one side's effort.",
      },
      {
        id: "p6-q3",
        prompt: "When a Lebanese speaker says 'I need to do a meeting بالـoffice', they are using:",
        options: [
          "Formal MSA register",
          "Code-switching (mixing Arabic and English/French)",
          "A rural dialect",
          "Classical Arabic vocabulary",
        ],
        correctIndex: 1,
        explanation:
          "Code-switching is extremely common in Lebanese Arabic, especially in Beirut. Speakers naturally mix Arabic with English and French words for work, technology, and education. This is a normal feature of the dialect, not an error.",
      },
      {
        id: "p6-q4",
        prompt: "In a formal setting, which register would a Lebanese speaker use?",
        options: [
          "Pure colloquial with slang",
          "A mix of Lebanese dialect with elevated MSA vocabulary",
          "Only Modern Standard Arabic",
          "Only French",
        ],
        correctIndex: 1,
        explanation:
          "Lebanese speakers shift to a higher register in formal settings by incorporating MSA vocabulary while keeping Lebanese pronunciation and grammar. Pure MSA sounds unnatural in speech. This 'educated spoken Arabic' is the norm in news, speeches, and formal contexts.",
      },
      {
        id: "p6-q5",
        prompt: "What does the proverb اللي بيزرع بيحصد mean?",
        promptArabic: "اللي بيزرع بيحصد",
        options: [
          "Farmers work hard",
          "You reap what you sow",
          "Harvest season is the best time",
          "Planting requires patience",
        ],
        correctIndex: 1,
        explanation:
          "اللي بيزرع بيحصد (illi byizraʕ byiḥṣod) literally means 'whoever plants, harvests' — the equivalent of 'you reap what you sow'. It teaches that your actions have consequences, good or bad. اللي = whoever (relative), بيزرع = plants, بيحصد = harvests.",
      },
      {
        id: "p6-q6",
        prompt: "The word عزومة in Lebanese culture refers to:",
        promptArabic: "عزومة",
        options: [
          "A funeral ceremony",
          "An invitation to eat / a dinner gathering",
          "A wedding gift",
          "A formal apology",
        ],
        correctIndex: 1,
        explanation:
          "عزومة (ʕazūme) means an invitation, specifically to share a meal. It's central to Lebanese hospitality culture. When someone says تعا عالعزومة (come to the gathering), it implies a generous spread of food. Refusing is considered impolite.",
      },
      {
        id: "p6-q7",
        prompt: "دبّر حالك is a Lebanese expression meaning:",
        promptArabic: "دبّر حالك",
        options: [
          "Be careful",
          "Figure it out yourself / manage on your own",
          "Get dressed up",
          "Calm down",
        ],
        correctIndex: 1,
        explanation:
          "دبّر حالك (dabbir ḥālak) means 'manage yourself' or 'figure it out'. دبّر (dabbir) = to arrange/manage, حالك (ḥālak) = yourself. This reflects the Lebanese spirit of resourcefulness. It can be said supportively or dismissively depending on tone.",
      },
      {
        id: "p6-q8",
        prompt: "Which phrase would you use to politely decline food at a Lebanese gathering?",
        options: [
          "ما بدي — مش جوعان",
          "يسلمو — شبعت كتير",
          "لأ شكراً — ما بحب الأكل",
          "بكفي هيك — الأكل مش طيب",
        ],
        correctIndex: 1,
        explanation:
          "يسلمو — شبعت كتير (yislamo — shbiʕt ktīr) means 'bless your hands — I'm very full'. This politely compliments the host while declining more food. The other options are too blunt or insulting. In Lebanese culture, you should always praise the food when declining.",
      },
      {
        id: "p6-q9",
        prompt: "العتابا والميجانا are:",
        options: [
          "Lebanese political parties",
          "Traditional Lebanese poetic song forms",
          "Types of Lebanese bread",
          "Mountain villages",
        ],
        correctIndex: 1,
        explanation:
          "العتابا (il-ʕatāba) and الميجانا (il-mījāna) are traditional Lebanese oral poetry forms often performed as improvised sung verses at gatherings. They follow specific rhyme schemes and are considered an important part of Lebanese cultural heritage.",
      },
      {
        id: "p6-q10",
        prompt: "بكرا بتنسى means:",
        promptArabic: "بكرا بتنسى",
        options: [
          "Tomorrow you will forget (used to comfort someone upset)",
          "You forgot about tomorrow",
          "Tomorrow is cancelled",
          "Don't forget tomorrow",
        ],
        correctIndex: 0,
        explanation:
          "بكرا بتنسى (bukra btinsa) = 'tomorrow you'll forget' — said to comfort someone going through a hard time. It reassures them that time heals. This reflects the Lebanese cultural value of resilience and moving forward despite hardship.",
      },
    ],
  },
  {
    id: "p6-fill",
    phaseId: 6,
    title: "Phase 6 Fill in the Blank — Proverbs & Culture",
    type: "fill-blank",
    fillBlanks: [
      {
        id: "p6-fb1",
        sentence: "إيد وحدة ما ___ means 'One hand doesn't clap'.",
        blank: "___",
        answer: "بتصفق",
        acceptableAnswers: ["bitsaffi2", "bitsaffi'", "btisaffiq", "بتصفق"],
        hint: "The verb for 'clap' with the feminine بـ prefix.",
      },
      {
        id: "p6-fb2",
        sentence: "اللي بيزرع ___ means 'Whoever plants, harvests'.",
        blank: "___",
        answer: "بيحصد",
        acceptableAnswers: ["byihsod", "byi7sod", "byihsud", "بيحصد"],
        hint: "The verb for 'harvest' with the بـ prefix.",
      },
      {
        id: "p6-fb3",
        sentence: "___ حالك means 'Figure it out yourself / manage on your own'.",
        blank: "___",
        answer: "دبّر",
        acceptableAnswers: ["dabbir", "dabber", "دبّر", "دبر"],
        hint: "A verb meaning 'to arrange/manage' — reflects Lebanese resourcefulness.",
      },
      {
        id: "p6-fb4",
        sentence: "يسلمو is short for الله ___ إيديك meaning 'God bless your hands'.",
        blank: "___",
        answer: "يسلّم",
        acceptableAnswers: ["yisallim", "yisallim", "يسلّم", "يسلم"],
        hint: "The verb meaning 'to keep safe / bless' in the jussive form.",
      },
      {
        id: "p6-fb5",
        sentence: "الغايب ___ معو means 'The absent person has their excuse'.",
        blank: "___",
        answer: "حجتو",
        acceptableAnswers: ["7ijjto", "hijjto", "hujjito", "حجتو", "حجته"],
        hint: "The word for 'his excuse/argument' — a noun with possessive suffix.",
      },
      {
        id: "p6-fb6",
        sentence: "A ___ is a Lebanese dinner invitation / gathering centered around food.",
        blank: "___",
        answer: "عزومة",
        acceptableAnswers: ["3azoome", "ʕazūme", "3azume", "عزومة"],
        hint: "Starts with ع — central to Lebanese hospitality culture.",
      },
    ],
  },
  {
    id: "p6-match",
    phaseId: 6,
    title: "Phase 6 Matching — Cultural Terms & Proverbs",
    type: "matching",
    matchingPairs: [
      {
        arabic: "عزومة",
        transliteration: "ʕazūme",
        english: "Dinner invitation / food gathering",
      },
      {
        arabic: "سهرة",
        transliteration: "sahre",
        english: "Evening social gathering / night out",
      },
      {
        arabic: "دبكة",
        transliteration: "dabke",
        english: "Traditional Lebanese folk dance",
      },
      {
        arabic: "أركيلة",
        transliteration: "argīle",
        english: "Hookah / water pipe",
      },
      {
        arabic: "منقوشة",
        transliteration: "man'ūshe",
        english: "Lebanese flatbread with thyme or cheese",
      },
      {
        arabic: "كرم الضيافة",
        transliteration: "karam iḍ-ḍiyēfe",
        english: "Hospitality / generosity to guests",
      },
      {
        arabic: "يسلمو",
        transliteration: "yislamo",
        english: "Bless your hands (said after eating)",
      },
      {
        arabic: "تكرم عينك",
        transliteration: "tikram ʕaynak",
        english: "Your wish is granted / it would be an honor",
      },
    ],
  },
];
