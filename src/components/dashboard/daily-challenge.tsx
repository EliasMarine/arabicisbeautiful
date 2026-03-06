"use client";

import { Zap, Trophy, CheckCircle2 } from "lucide-react";

interface DailyChallengeProps {
  cardsDue: number;
  minutesStudied: number;
  goalMinutes: number;
  streak: number;
}

const MOTIVATIONAL_QUOTES = [
  { text: "Every word you learn brings you closer to your roots.", ar: "كل كلمة بتقرّبك من جذورك" },
  { text: "Small steps every day lead to big results.", ar: "خطوات صغيرة كل يوم بتعطي نتائج كبيرة" },
  { text: "The best time to learn was yesterday. The next best time is now.", ar: "أحسن وقت للتعلّم كان مبارح. التاني هلّق" },
  { text: "You are building something beautiful.", ar: "عم تبني شي حلو" },
  { text: "Consistency beats intensity. Keep showing up!", ar: "الاستمرارية بتغلب الشدّة" },
];

function getDailyChallenge(cardsDue: number, minutesStudied: number, goalMinutes: number) {
  // Pick a challenge based on what's most relevant
  if (cardsDue >= 10) {
    return {
      title: "Flashcard Master",
      description: `Review ${Math.min(cardsDue, 10)} flashcards today`,
      xpReward: 50,
      progress: 0,
      total: Math.min(cardsDue, 10),
    };
  }
  if (minutesStudied < goalMinutes) {
    return {
      title: "Study Sprint",
      description: `Study for ${goalMinutes} minutes today`,
      xpReward: 30,
      progress: minutesStudied,
      total: goalMinutes,
    };
  }
  if (cardsDue > 0) {
    return {
      title: "Quick Review",
      description: `Clear your ${cardsDue} pending review${cardsDue !== 1 ? "s" : ""}`,
      xpReward: 25,
      progress: 0,
      total: cardsDue,
    };
  }
  return null; // All caught up
}

export function DailyChallenge({ cardsDue, minutesStudied, goalMinutes, streak }: DailyChallengeProps) {
  const challenge = getDailyChallenge(cardsDue, minutesStudied, goalMinutes);

  // No active challenge — show motivational quote
  if (!challenge) {
    const quoteIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
    const quote = MOTIVATIONAL_QUOTES[quoteIndex];

    return (
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
        style={{
          background: "linear-gradient(135deg, var(--success) 0%, #00cec9 50%, var(--info) 100%)",
          animation: "fadeUp 0.4s ease-out 0.2s both",
        }}
      >
        <div className="absolute top-3 right-3 opacity-10">
          <CheckCircle2 size={80} className="text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={20} className="text-white" />
            <span className="text-sm font-bold text-white/90 uppercase tracking-wide">All Caught Up!</span>
          </div>
          <p className="text-white font-bold text-lg leading-snug mb-1">
            {quote.text}
          </p>
          <p className="text-white/70 text-sm font-medium" dir="rtl" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
            {quote.ar}
          </p>
          {streak > 0 && (
            <p className="text-white/80 text-xs mt-3 font-semibold">
              {streak} day streak and counting!
            </p>
          )}
        </div>
      </div>
    );
  }

  const progressPercent = challenge.total > 0 ? Math.min(100, Math.round((challenge.progress / challenge.total) * 100)) : 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(135deg, var(--brand) 0%, var(--xp-purple) 100%)",
        animation: "fadeUp 0.4s ease-out 0.2s both",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-2 right-4 opacity-10">
        <Trophy size={80} className="text-white" />
      </div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-10" style={{ background: "white" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="text-yellow-300" />
          <span className="text-sm font-bold text-white/90 uppercase tracking-wide">Daily Challenge</span>
        </div>

        <h3 className="text-white font-extrabold text-xl mb-1">
          {challenge.title}
        </h3>
        <p className="text-white/80 text-sm font-medium mb-4">
          {challenge.description}
        </p>

        {/* Progress bar */}
        {challenge.progress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/70 text-xs font-semibold">Progress</span>
              <span className="text-white/70 text-xs font-semibold">
                {challenge.progress}/{challenge.total}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* XP Reward badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Star size={14} className="text-yellow-300" />
          <span className="text-white text-xs font-bold">+{challenge.xpReward} XP reward</span>
        </div>
      </div>
    </div>
  );
}

function Star({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
