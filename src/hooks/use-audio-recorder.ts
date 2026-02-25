"use client";

import { useState, useRef, useCallback } from "react";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  audioBlob: Blob | null;
  error: string | null;
  duration: number;
}

const MAX_DURATION_MS = 30_000; // 30 seconds max

/**
 * Hook for recording audio using the MediaRecorder API.
 * Returns a blob in webm or mp4 format depending on browser support.
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Prefer webm, fall back to mp4 for Safari
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setIsRecording(false);
        setDuration(Date.now() - startTimeRef.current);
        cleanup();
        resolveStopRef.current?.(blob);
        resolveStopRef.current = null;
      };

      recorder.onerror = () => {
        setError("Recording failed");
        setIsRecording(false);
        cleanup();
        resolveStopRef.current?.(null);
        resolveStopRef.current = null;
      };

      recorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Auto-stop after max duration
      timerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, MAX_DURATION_MS);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else {
        setError("Could not access microphone. Please check your device settings.");
      }
      cleanup();
    }
  }, [cleanup]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current?.state === "recording") {
        resolveStopRef.current = resolve;
        mediaRecorderRef.current.stop();
      } else {
        resolve(audioBlob);
      }
    });
  }, [audioBlob]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    error,
    duration,
  };
}
