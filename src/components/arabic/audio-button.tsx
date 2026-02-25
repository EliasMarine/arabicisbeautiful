"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioButtonProps {
  src?: string;
  size?: "sm" | "md";
  className?: string;
  onDemandText?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
}

// Cache voices once loaded (iOS Safari loads them async)
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (cachedVoices.length > 0) return cachedVoices;
  if (!window.speechSynthesis) return [];
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

// Pre-load voices when available (iOS fires this event async)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

// 5 speed options: slow → fast
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const;
const SPEED_LABELS = ["0.5x", "0.75x", "1x", "1.25x", "1.5x"] as const;
const BROWSER_RATES = [0.45, 0.65, 0.85, 1.0, 1.15] as const;
const DEFAULT_SPEED_INDEX = 2; // 1x

function getStoredSpeedIndex(): number {
  if (typeof window === "undefined") return DEFAULT_SPEED_INDEX;
  const stored = localStorage.getItem("audioSpeed");
  const idx = stored ? parseInt(stored, 10) : DEFAULT_SPEED_INDEX;
  return idx >= 0 && idx < SPEED_OPTIONS.length ? idx : DEFAULT_SPEED_INDEX;
}

function speakWithBrowser(text: string, speedIndex = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    // iOS Safari fix: cancel any pending speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar";
    utterance.rate = BROWSER_RATES[speedIndex] ?? 0.85;

    // Try to find an Arabic voice
    const voices = loadVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      // iOS sometimes fires "interrupted" error when cancelling — not a real error
      if (e.error === "interrupted") {
        resolve();
      } else {
        reject(new Error("Speech synthesis failed"));
      }
    };

    // iOS Safari fix: needs a small delay after cancel
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  });
}

export function AudioButton({
  src,
  size = "md",
  className,
  onDemandText,
  autoPlay = false,
  onPlay,
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(getStoredSpeedIndex);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speedMenuRef = useRef<HTMLDivElement | null>(null);

  const play = useCallback(async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop any ongoing browser speech
    window.speechSynthesis?.cancel();

    let audioSrc = src || "";

    // If no pre-generated file, try on-demand generation
    if (onDemandText && !src) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/audio/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: onDemandText }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        audioSrc = data.url;
        console.log("[Audio] API returned URL:", audioSrc);
      } catch (err) {
        console.error("[Audio] API failed, using browser speech:", err);
        // Fallback to browser speech synthesis
        try {
          setIsPlaying(true);
          setIsLoading(false);
          onPlay?.();
          await speakWithBrowser(onDemandText, speedIndex);
          setIsPlaying(false);
          return;
        } catch {
          setIsLoading(false);
          setIsPlaying(false);
          return;
        }
      }
    }

    if (!audioSrc) {
      // No src and no onDemandText — try browser fallback with empty text
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const audio = new Audio(audioSrc);
    audio.playbackRate = SPEED_OPTIONS[speedIndex] ?? 1;
    audioRef.current = audio;

    audio.onended = () => setIsPlaying(false);
    audio.onerror = (e) => {
      console.error("[Audio] File load error, falling back to browser speech:", audioSrc, e);
      setIsLoading(false);
      setIsPlaying(false);
      // Fallback to browser TTS if audio file fails
      if (onDemandText) {
        speakWithBrowser(onDemandText, speedIndex)
          .then(() => setIsPlaying(false))
          .catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
    };

    // Use play() directly — iOS requires it from user gesture context
    // play() returns a promise, handle loading state via that
    audio.play()
      .then(() => {
        console.log("[Audio] ✓ Playing MP3 from:", audioSrc);
        setIsLoading(false);
        setIsPlaying(true);
        onPlay?.();
      })
      .catch((err) => {
        console.error("[Audio] play() failed, falling back to browser speech:", err);
        setIsLoading(false);
        // Fallback to browser TTS on play failure (e.g. iOS autoplay block)
        if (onDemandText) {
          speakWithBrowser(onDemandText, speedIndex)
            .then(() => setIsPlaying(false))
            .catch(() => setIsPlaying(false));
          setIsPlaying(true);
        }
      });
  }, [src, onDemandText, speedIndex, onPlay]);

  // Auto-play when autoPlay prop is true
  useEffect(() => {
    if (autoPlay && (src || onDemandText)) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => play(), 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectSpeed = useCallback((idx: number) => {
    setSpeedIndex(idx);
    localStorage.setItem("audioSpeed", String(idx));
    setShowSpeedMenu(false);
    // Update currently playing audio if any
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.playbackRate = SPEED_OPTIONS[idx] ?? 1;
    }
  }, []);

  const toggleSpeedMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSpeedMenu((v) => !v);
  }, []);

  // Close speed menu when clicking outside
  useEffect(() => {
    if (!showSpeedMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSpeedMenu]);

  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : 18;
  const isDefaultSpeed = speedIndex === DEFAULT_SPEED_INDEX;

  return (
    <span className={cn("inline-flex items-center gap-1 relative", className)}>
      <button
        onClick={play}
        disabled={isLoading}
        className={cn(
          "rounded-full flex items-center justify-center transition-all",
          "bg-[var(--phase-color)] text-white hover:opacity-80",
          "disabled:opacity-50",
          sizeClasses
        )}
        title="Play pronunciation"
      >
        {isLoading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Volume2
            size={iconSize}
            className={isPlaying ? "animate-pulse" : ""}
          />
        )}
      </button>
      <button
        onClick={toggleSpeedMenu}
        className={cn(
          "text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full transition-colors leading-none",
          isDefaultSpeed
            ? "text-[var(--muted)]/60 hover:text-[var(--muted)] hover:bg-[var(--sand)]"
            : "text-[var(--phase-color)] bg-[var(--sand)]"
        )}
        title="Change playback speed"
      >
        {SPEED_LABELS[speedIndex]}
      </button>
      {showSpeedMenu && (
        <div
          ref={speedMenuRef}
          className="absolute top-full left-0 mt-1 bg-[var(--card-bg)] border border-[var(--sand)] rounded-lg shadow-lg p-1 z-50 flex flex-col min-w-[4.5rem]"
        >
          {SPEED_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={(e) => { e.stopPropagation(); selectSpeed(i); }}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md text-left transition-colors whitespace-nowrap",
                i === speedIndex
                  ? "bg-[var(--phase-color)] text-white font-bold"
                  : "text-[var(--dark)] hover:bg-[var(--sand)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
