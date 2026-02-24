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

const SPEED_OPTIONS = [1, 0.7, 1.3] as const;
const SPEED_LABELS = ["1x", "0.7x", "1.3x"] as const;
const BROWSER_RATES = [0.85, 0.6, 1.1] as const;

function getStoredSpeedIndex(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem("audioSpeed");
  const idx = stored ? parseInt(stored, 10) : 0;
  return idx >= 0 && idx < SPEED_OPTIONS.length ? idx : 0;
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const cycleSpeed = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(next);
    localStorage.setItem("audioSpeed", String(next));
  }, [speedIndex]);

  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
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
      {speedIndex !== 0 && (
        <button
          onClick={cycleSpeed}
          className="text-[0.55rem] font-bold text-[var(--muted)] hover:text-[var(--dark)] transition-colors"
          title="Change speed"
        >
          {SPEED_LABELS[speedIndex]}
        </button>
      )}
      {speedIndex === 0 && size !== "sm" && (
        <button
          onClick={cycleSpeed}
          className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]/40 hover:bg-[var(--muted)] transition-colors"
          title="Change speed"
        />
      )}
    </span>
  );
}
