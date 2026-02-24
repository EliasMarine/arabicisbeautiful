import type { ProverbItem } from "../types";

/** Phase 5 proverbs */
export const phase5Proverbs: ProverbItem[] = [
  {
    id: "p5-prov-btaarfo",
    arabic: "اللي بتعرفو أحسن من اللي ما بتعرفو.",
    transliteration: "Illi btaʕrufō aḥsan min illi mā btaʕrufō.",
    english: "What you know is better than what you don't know.",
    meaning:
      'Used when someone prefers the known over the unknown, similar to "better the devil you know."',
  },
  {
    id: "p5-prov-sabr",
    arabic: "الصبر مفتاح الفرج.",
    transliteration: "Iṣ-ṣabr muftāḥ il-faraj.",
    english: "Patience is the key to relief.",
    meaning:
      "Deeply rooted in Lebanese and Arab culture. Said in times of difficulty to encourage endurance.",
  },
  {
    id: "p5-prov-dar",
    arabic: "دار اللي تحبو وسكن جارو.",
    transliteration: "Dār illi tḥabbo w-skan jāro.",
    english:
      "Go around the house of the one you love and settle near their neighbor.",
    meaning:
      "About the importance of proximity to those you love — community over convenience.",
  },
  {
    id: "p5-prov-shaf",
    arabic: "اللي شاف متل اللي ما شاف.",
    transliteration: "Illi shāf mitl illi mā shāf.",
    english: "The one who saw is like the one who didn't see.",
    meaning:
      "Said of someone who experienced something remarkable but seems unchanged — experience alone isn't wisdom.",
  },
];

/** Phase 6 proverbs (advanced) */
export const phase6Proverbs: ProverbItem[] = [
  {
    id: "p6-prov-hafar",
    arabic: "من حفر حفرة لأخوه وقع فيها.",
    transliteration: "Man ḥafar ḥufra la-akhūh waʔaʕ fīha.",
    english: "Whoever digs a pit for his brother falls into it himself.",
    meaning:
      "Karma — the person who schemes against others will suffer their own schemes. Very common in everyday speech.",
  },
  {
    id: "p6-prov-bakir",
    arabic: "اللي بيطلع بكير بيلقى الغير.",
    transliteration: "Illi byiṭlaʕ bakīr byilʔā l-ghēr.",
    english: "The one who gets up early finds more.",
    meaning:
      'The Lebanese "early bird gets the worm." Used to encourage hard work and initiative.',
  },
  {
    id: "p6-prov-bahar",
    arabic: "جربت البحر ما عجبني، جرّب الله وشوف.",
    transliteration: "Jarrabt il-baḥr mā ʕajabni, jarrib Allah w-shūf.",
    english: "I tried the sea and didn't like it — try God and see.",
    meaning:
      "Said when someone has exhausted worldly solutions and needs to surrender and trust. Deeply spiritual Lebanese expression.",
  },
  {
    id: "p6-prov-id-wahde",
    arabic: "إيد وحدة ما بتصفق.",
    transliteration: "Ēd wāḥde mā btṣaffiq.",
    english: "One hand doesn't clap.",
    meaning:
      "Nothing happens without two parties — used in conflict, relationships, and business to say both sides share responsibility.",
  },
  {
    id: "p6-prov-ghayib",
    arabic: "الغايب حجتو معو.",
    transliteration: "Il-ghāyib ḥujjto maʕo.",
    english: "The absent one has their excuse with them.",
    meaning:
      "Don't judge someone who isn't present to defend themselves — very important in Lebanese social culture.",
  },
  {
    id: "p6-prov-irshak",
    arabic: "خبّي قرشك الأبيض ليومك الأسود.",
    transliteration: "Khabbī ʔurshak il-abyaḍ li-yōmak il-aswad.",
    english: "Save your white coin for your black day.",
    meaning:
      '"White coin" = silver (small savings); "black day" = hard times. Said to encourage saving and planning for the future.',
  },
];

export const allProverbs: ProverbItem[] = [
  ...phase5Proverbs,
  ...phase6Proverbs,
];
