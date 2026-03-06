"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Check, X, MessageCircle, Trophy } from "lucide-react";

interface ConversationSimProps {
  scenario: string;
  exchanges: {
    speaker: "ai" | "user";
    text?: string;
    options?: { text: string; isCorrect: boolean; feedback: string }[];
  }[];
  onComplete: (score: number, total: number) => void;
  className?: string;
}

export function ConversationSim({
  scenario,
  exchanges,
  onComplete,
  className,
}: ConversationSimProps) {
  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [visibleExchanges, setVisibleExchanges] = useState<number[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Map<number, number>>(new Map());
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalUserChoices, setTotalUserChoices] = useState(0);
  const [completed, setCompleted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Count total user exchanges for scoring
  const totalUserExchanges = exchanges.filter(
    (e) => e.speaker === "user" && e.options
  ).length;

  // Auto-reveal exchanges with a typing delay
  useEffect(() => {
    if (currentExchangeIndex >= exchanges.length) {
      // All exchanges done
      if (!completed) {
        setCompleted(true);
        onComplete(score, totalUserExchanges);
      }
      return;
    }

    const exchange = exchanges[currentExchangeIndex];

    // AI messages auto-appear after a short delay
    if (exchange.speaker === "ai") {
      const timer = setTimeout(() => {
        setVisibleExchanges((prev) => [...prev, currentExchangeIndex]);
        setCurrentExchangeIndex((prev) => prev + 1);
      }, visibleExchanges.length === 0 ? 300 : 800);
      return () => clearTimeout(timer);
    }

    // User exchanges wait for interaction
    if (exchange.speaker === "user") {
      setVisibleExchanges((prev) => [...prev, currentExchangeIndex]);
    }
  }, [currentExchangeIndex, exchanges, visibleExchanges.length, completed, score, totalUserExchanges, onComplete]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleExchanges, showFeedback]);

  function handleOptionSelect(exchangeIndex: number, optionIndex: number) {
    if (selectedOptions.has(exchangeIndex)) return;

    const exchange = exchanges[exchangeIndex];
    const option = exchange.options?.[optionIndex];
    if (!option) return;

    setSelectedOptions((prev) => new Map(prev).set(exchangeIndex, optionIndex));
    setShowFeedback(exchangeIndex);
    setTotalUserChoices((prev) => prev + 1);

    if (option.isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Advance to next exchange after feedback delay
    setTimeout(() => {
      setShowFeedback(null);
      setCurrentExchangeIndex((prev) => prev + 1);
    }, 2000);
  }

  function reset() {
    setCurrentExchangeIndex(0);
    setVisibleExchanges([]);
    setSelectedOptions(new Map());
    setShowFeedback(null);
    setScore(0);
    setTotalUserChoices(0);
    setCompleted(false);
  }

  const pct = totalUserExchanges > 0 ? Math.round((score / totalUserExchanges) * 100) : 0;

  return (
    <div
      className={cn(
        "bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--brand)] to-[#c23152] px-5 py-3 flex items-center gap-3">
        <MessageCircle size={20} className="text-white" />
        <div>
          <p className="text-white text-sm font-bold">Conversation Practice</p>
          <p className="text-white/80 text-xs">{scenario}</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="p-4 sm:p-5 max-h-[500px] overflow-y-auto space-y-3">
        {visibleExchanges.map((exchangeIdx) => {
          const exchange = exchanges[exchangeIdx];
          const isAI = exchange.speaker === "ai";
          const selectedIdx = selectedOptions.get(exchangeIdx);
          const hasSelected = selectedIdx !== undefined;

          return (
            <div key={exchangeIdx}>
              {/* AI message bubble */}
              {isAI && exchange.text && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-[var(--bg-surface)] rounded-2xl rounded-tl-md px-4 py-3 border border-[var(--border)]">
                    <p className="text-sm text-[var(--text)] leading-relaxed">
                      {exchange.text}
                    </p>
                  </div>
                </div>
              )}

              {/* User options or selected response */}
              {!isAI && exchange.options && (
                <div className="flex flex-col items-end gap-2">
                  {hasSelected ? (
                    <>
                      {/* Show selected option as a chat bubble */}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl rounded-tr-md px-4 py-3 border-2",
                          exchange.options[selectedIdx!].isCorrect
                            ? "bg-[var(--success-dim)] border-[var(--success)]"
                            : "bg-red-500/10 border-[var(--danger)]"
                        )}
                      >
                        <p className="text-sm text-[var(--text)] font-semibold">
                          {exchange.options[selectedIdx!].text}
                        </p>
                      </div>
                      {/* Feedback message */}
                      {showFeedback === exchangeIdx && (
                        <div
                          className={cn(
                            "max-w-[85%] rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300",
                            exchange.options[selectedIdx!].isCorrect
                              ? "bg-[var(--success-dim)] text-[var(--success)] border border-[var(--success)]"
                              : "bg-red-500/10 text-[var(--danger)] border border-[var(--danger)]"
                          )}
                        >
                          {exchange.options[selectedIdx!].isCorrect ? (
                            <Check size={14} className="flex-shrink-0" />
                          ) : (
                            <X size={14} className="flex-shrink-0" />
                          )}
                          {exchange.options[selectedIdx!].feedback}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Show option buttons for user to pick */
                    <div className="w-full space-y-2">
                      <p className="text-xs text-[var(--text-secondary)] text-right mb-1">
                        Choose your response:
                      </p>
                      {exchange.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(exchangeIdx, optIdx)}
                          className="w-full text-right rounded-xl px-4 py-3 text-sm font-semibold bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text)] hover:border-[var(--brand)] hover:bg-[var(--brand-dim)] hover:-translate-y-0.5 transition-all min-h-[44px]"
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator for AI */}
        {currentExchangeIndex < exchanges.length &&
          exchanges[currentExchangeIndex].speaker === "ai" &&
          !visibleExchanges.includes(currentExchangeIndex) && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-surface)] rounded-2xl rounded-tl-md px-4 py-3 border border-[var(--border)]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

        <div ref={chatEndRef} />
      </div>

      {/* Completion summary */}
      {completed && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-surface)] p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={24} className="text-[var(--warning)]" />
            <h3 className="text-lg font-bold text-[var(--text)]">
              Conversation Complete!
            </h3>
          </div>
          <p className="text-3xl font-bold text-[var(--brand)] mb-1">
            {score}/{totalUserExchanges}
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {pct}% correct responses
          </p>

          {/* Score bar */}
          <div className="w-full max-w-[200px] mx-auto h-2 bg-[var(--border)] rounded-full mb-4 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                pct >= 80 ? "bg-[var(--success)]" : pct >= 50 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>

          <button
            onClick={reset}
            className="bg-[var(--brand)] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
