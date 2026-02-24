"use client";

import { useState, useRef, useCallback } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(async (src: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsLoading(true);
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.oncanplay = () => {
      setIsLoading(false);
      audio.play();
      setIsPlaying(true);
    };
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  return { play, stop, isPlaying, isLoading };
}
