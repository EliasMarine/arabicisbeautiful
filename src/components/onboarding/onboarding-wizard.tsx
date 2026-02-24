"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Brain, Volume2, PenLine, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const FEATURES = [
  {
    icon: BookOpen,
    title: "6 Learning Phases",
    description: "From basic sounds to full fluency, each phase builds on the last with vocabulary, grammar, dialogues, and culture.",
  },
  {
    icon: Brain,
    title: "Spaced Repetition",
    description: "Review flashcards at optimal intervals using the SM-2 algorithm. Never forget what you learn.",
  },
  {
    icon: Volume2,
    title: "Audio Pronunciation",
    description: "Listen to native-quality Arabic pronunciation with adjustable playback speed.",
  },
  {
    icon: PenLine,
    title: "Journal & Exercises",
    description: "Practice with quizzes, matching games, and keep a journal of your progress.",
  },
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(10);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleFinish() {
    setSaving(true);
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyGoalMinutes: goalMinutes }),
      });
      onComplete();
      router.push("/phases/reactivation");
    } catch {
      onComplete();
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--cream)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "bg-[var(--gold)] w-6" : i < step ? "bg-[var(--gold)]" : "bg-[var(--sand)]"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <p dir="rtl" className="font-[Noto_Naskh_Arabic,serif] text-4xl text-[var(--gold)] mb-4">
              أهلا وسهلا
            </p>
            <h1 className="font-[var(--font-playfair)] text-3xl font-bold text-[var(--dark)] mb-3">
              Welcome to Arabic is Beautiful
            </h1>
            <p className="text-[var(--muted)] text-lg mb-8">
              Your journey to learning Lebanese Arabic starts here
            </p>
            <button
              onClick={() => setStep(1)}
              className="bg-[var(--gold)] text-white px-8 py-3 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            >
              Get Started
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 1: Daily Goal */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--dark)] mb-2">
              Set Your Daily Goal
            </h2>
            <p className="text-[var(--muted)] mb-8">
              How many minutes per day would you like to study?
            </p>

            <div className="mb-6">
              <p className="text-5xl font-bold text-[var(--gold)] mb-2">{goalMinutes}</p>
              <p className="text-sm text-[var(--muted)]">minutes per day</p>
            </div>

            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={goalMinutes}
              onChange={(e) => setGoalMinutes(parseInt(e.target.value, 10))}
              className="w-full mb-2 accent-[var(--gold)]"
            />
            <div className="flex justify-between text-xs text-[var(--muted)] mb-8">
              <span>5 min</span>
              <span>15 min</span>
              <span>30 min</span>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-3 rounded-xl font-semibold text-[var(--muted)] hover:text-[var(--dark)] transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="bg-[var(--gold)] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Next
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Features */}
        {step === 2 && (
          <div>
            <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--dark)] mb-2 text-center">
              What You Can Do
            </h2>
            <p className="text-[var(--muted)] text-center mb-6">
              Everything you need to learn Lebanese Arabic
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--sand)]"
                  >
                    <Icon size={24} className="text-[var(--gold)] mb-2" />
                    <h3 className="font-semibold text-sm text-[var(--dark)] mb-1">
                      {f.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl font-semibold text-[var(--muted)] hover:text-[var(--dark)] transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-[var(--gold)] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Next
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Start Learning */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen size={36} className="text-[var(--gold)]" />
            </div>
            <h2 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--dark)] mb-2">
              You&apos;re All Set!
            </h2>
            <p className="text-[var(--muted)] mb-2">
              Your daily goal: <strong className="text-[var(--dark)]">{goalMinutes} minutes</strong>
            </p>
            <p className="text-[var(--muted)] mb-8">
              Let&apos;s start with Phase 1: Reactivation
            </p>
            <button
              onClick={handleFinish}
              disabled={saving}
              className="bg-[var(--gold)] text-white px-10 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {saving ? "Saving..." : "Start Learning!"}
              {!saving && <ArrowRight size={20} />}
            </button>
            <button
              onClick={() => setStep(2)}
              className="mt-4 text-sm text-[var(--muted)] hover:text-[var(--dark)] transition-colors"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
