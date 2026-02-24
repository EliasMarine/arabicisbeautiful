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

function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    // iOS Safari fix: cancel any pending speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar";
    utterance.rate = 0.85;

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
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        audioSrc = data.url;
      } catch {
        // Fallback to browser speech synthesis
        try {
          setIsPlaying(true);
          setIsLoading(false);
          await speakWithBrowser(onDemandText);
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
    audioRef.current = audio;

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
      // Fallback to browser TTS if audio file fails
      if (onDemandText) {
        speakWithBrowser(onDemandText)
          .then(() => setIsPlaying(false))
          .catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
    };

    // Use play() directly — iOS requires it from user gesture context
    // play() returns a promise, handle loading state via that
    audio.play()
      .then(() => {
        setIsLoading(false);
        setIsPlaying(true);
      })
      .catch(() => {
        setIsLoading(false);
        // Fallback to browser TTS on play failure (e.g. iOS autoplay block)
        if (onDemandText) {
          speakWithBrowser(onDemandText)
            .then(() => setIsPlaying(false))
            .catch(() => setIsPlaying(false));
          setIsPlaying(true);
        }
      });
  }, [src, onDemandText]);

  // Auto-play when autoPlay prop is true
  useEffect(() => {
    if (autoPlay && (src || onDemandText)) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => play(), 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <button
      onClick={play}
      disabled={isLoading}
      className={cn(
        "rounded-full flex items-center justify-center transition-all",
        "bg-[var(--phase-color)] text-white hover:opacity-80",
        "disabled:opacity-50",
        sizeClasses,
        className
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
  );
}
