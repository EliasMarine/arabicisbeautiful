"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { RotateCcw, Check } from "lucide-react";

interface LetterCanvasProps {
  letter: string;
  size?: number;
  onScore?: (score: number) => void;
}

/**
 * Canvas-based letter tracing component.
 * Renders a faded letter guide and lets the user draw over it.
 * Scoring uses pixel overlap between user strokes and the target letter.
 */
export function LetterCanvas({ letter, size = 280, onScore }: LetterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const pathsRef = useRef<{ x: number; y: number }[][]>([]);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Draw the guide letter on the canvas
  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = "rgba(232, 220, 200, 0.3)";
    ctx.fillRect(0, 0, size, size);

    // Grid lines for guidance
    ctx.strokeStyle = "rgba(232, 220, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw guide letter (faded)
    ctx.fillStyle = "rgba(201, 151, 58, 0.2)";
    ctx.font = `${size * 0.65}px "Noto Naskh Arabic", "Amiri", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.fillText(letter, size / 2, size / 2 + size * 0.03);

    // Redraw all existing paths
    for (const path of pathsRef.current) {
      drawPath(ctx, path);
    }
  }, [letter, size]);

  // Get the actual phase color from CSS variable
  function getPhaseColor(): string {
    if (typeof window === "undefined") return "#8B1A1A";
    return getComputedStyle(document.documentElement).getPropertyValue("--phase-color").trim() || "#8B1A1A";
  }

  // Draw a single path
  function drawPath(ctx: CanvasRenderingContext2D, path: { x: number; y: number }[]) {
    if (path.length < 2) return;
    ctx.strokeStyle = getPhaseColor();
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  }

  // Get canvas-relative coordinates from pointer event
  function getCoords(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * size,
      y: ((e.clientY - rect.top) / rect.height) * size,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setHasDrawn(true);
    const coords = getCoords(e);
    currentPathRef.current = [coords];
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coords = getCoords(e);
    currentPathRef.current.push(coords);

    // Draw the latest segment
    const path = currentPathRef.current;
    if (path.length >= 2) {
      ctx.strokeStyle = getPhaseColor();
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(path[path.length - 2].x, path[path.length - 2].y);
      ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y);
      ctx.stroke();
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    pathsRef.current.push([...currentPathRef.current]);
    currentPathRef.current = [];
  }

  // Clear canvas and reset
  function handleClear() {
    pathsRef.current = [];
    currentPathRef.current = [];
    setHasDrawn(false);
    setScore(null);
    drawGuide();
  }

  // Calculate overlap score
  function handleCheck() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Render target letter on offscreen canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const offCtx = offscreen.getContext("2d")!;
    offCtx.fillStyle = "#000000";
    offCtx.font = `${size * 0.65}px "Noto Naskh Arabic", "Amiri", serif`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.direction = "rtl";
    offCtx.fillText(letter, size / 2, size / 2 + size * 0.03);

    // Get target pixel data
    const targetData = offCtx.getImageData(0, 0, size, size).data;

    // Render user strokes on another offscreen canvas
    const userCanvas = document.createElement("canvas");
    userCanvas.width = size;
    userCanvas.height = size;
    const userCtx = userCanvas.getContext("2d")!;
    userCtx.strokeStyle = "#000000";
    userCtx.lineWidth = 6;
    userCtx.lineCap = "round";
    userCtx.lineJoin = "round";
    for (const path of pathsRef.current) {
      if (path.length < 2) continue;
      userCtx.beginPath();
      userCtx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        userCtx.lineTo(path[i].x, path[i].y);
      }
      userCtx.stroke();
    }

    const userData = userCtx.getImageData(0, 0, size, size).data;

    // Count pixels
    let targetPixels = 0;
    let overlapPixels = 0;
    let userOnlyPixels = 0;

    for (let i = 3; i < targetData.length; i += 4) {
      const isTarget = targetData[i] > 128;
      const isUser = userData[i] > 128;

      if (isTarget) targetPixels++;
      if (isTarget && isUser) overlapPixels++;
      if (isUser && !isTarget) userOnlyPixels++;
    }

    // Score: overlap percentage minus penalty for strokes outside the letter
    const coverage = targetPixels > 0 ? overlapPixels / targetPixels : 0;
    const precision = (overlapPixels + userOnlyPixels) > 0
      ? overlapPixels / (overlapPixels + userOnlyPixels)
      : 0;

    // Combined score: 70% coverage + 30% precision
    const rawScore = Math.round((coverage * 0.7 + precision * 0.3) * 100);
    const finalScore = Math.min(100, rawScore);

    setScore(finalScore);
    onScore?.(finalScore);
  }

  // Redraw guide when letter changes
  useEffect(() => {
    pathsRef.current = [];
    currentPathRef.current = [];
    setHasDrawn(false);
    setScore(null);
    // Small delay to ensure font is loaded
    const timer = setTimeout(drawGuide, 100);
    return () => clearTimeout(timer);
  }, [letter, drawGuide]);

  // Stars based on score
  const stars = score !== null ? (score >= 80 ? 3 : score >= 50 ? 2 : score >= 20 ? 1 : 0) : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border-2 border-[var(--sand)] rounded-xl cursor-crosshair touch-none bg-[var(--card-bg)]"
        style={{ width: size, height: size, maxWidth: "100%" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Score display */}
      {score !== null && (
        <div className="text-center">
          <div className="text-2xl mb-1">
            {[1, 2, 3].map((s) => (
              <span key={s} className={s <= stars ? "text-[var(--gold)]" : "text-[var(--sand)]"}>
                ★
              </span>
            ))}
          </div>
          <p className="text-sm font-semibold text-[var(--dark)]">{score}% match</p>
          <p className="text-xs text-[var(--muted)]">
            {score >= 80
              ? "Excellent!"
              : score >= 50
              ? "Good effort! Try to follow the shape more closely."
              : "Keep practicing! Trace over the faded letter."}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--muted)] bg-[var(--sand)] rounded-lg hover:opacity-80 transition-opacity"
        >
          <RotateCcw size={14} /> Clear
        </button>
        {hasDrawn && score === null && (
          <button
            onClick={handleCheck}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--phase-color)] rounded-lg hover:opacity-80 transition-opacity"
          >
            <Check size={14} /> Check
          </button>
        )}
      </div>
    </div>
  );
}
