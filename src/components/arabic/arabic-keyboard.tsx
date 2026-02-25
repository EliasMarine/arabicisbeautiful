"use client";

import { useState } from "react";
import { Keyboard, X } from "lucide-react";

interface ArabicKeyboardProps {
  onInsert: (char: string) => void;
  onBackspace: () => void;
  /** Controlled open state — when provided, the component skips its own toggle button */
  isOpen?: boolean;
  /** Called when the user clicks the close (X) button in controlled mode */
  onClose?: () => void;
}

const ROWS = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"],
];

const DIACRITICS = ["َ", "ُ", "ِ", "ّ", "ْ", "ً", "ٌ", "ٍ"];

/** Shared keyboard panel layout (used by both controlled and uncontrolled modes) */
function KeyboardPanel({
  onInsert,
  onBackspace,
  onClose,
}: {
  onInsert: (char: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--sand)] rounded-xl shadow-lg p-3 mt-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Arabic Keyboard
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--muted)] hover:text-[var(--dark)] p-0.5"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main letter rows */}
      <div className="space-y-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1" dir="rtl">
            {row.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => onInsert(char)}
                className="w-8 h-9 sm:w-9 sm:h-10 bg-[var(--sand)] hover:bg-[var(--phase-color)] hover:text-white rounded-md text-base font-[Noto_Naskh_Arabic,serif] transition-colors flex items-center justify-center"
              >
                {char}
              </button>
            ))}
            {ri === 2 && (
              <button
                type="button"
                onClick={onBackspace}
                className="px-3 h-9 sm:h-10 bg-[var(--sand)] hover:bg-red-500/20 text-red-400 rounded-md text-xs font-semibold transition-colors"
              >
                ←
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Diacritics row */}
      <div className="flex justify-center gap-1 mt-2 pt-2 border-t border-[var(--sand)]" dir="rtl">
        <span className="text-[10px] text-[var(--muted)] self-center mr-1">تشكيل:</span>
        {DIACRITICS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onInsert(d)}
            className="w-8 h-8 bg-[var(--cream)] hover:bg-[var(--gold)] hover:text-white rounded-md text-lg font-[Noto_Naskh_Arabic,serif] transition-colors flex items-center justify-center"
          >
            {"ـ" + d}
          </button>
        ))}
      </div>

      {/* Space bar */}
      <div className="flex justify-center gap-1 mt-1.5">
        <button
          type="button"
          onClick={() => onInsert(" ")}
          className="flex-1 max-w-[200px] h-8 bg-[var(--sand)] hover:bg-[var(--phase-color)] hover:text-white rounded-md text-xs font-semibold transition-colors"
        >
          Space
        </button>
      </div>
    </div>
  );
}

export function ArabicKeyboard({ onInsert, onBackspace, isOpen, onClose }: ArabicKeyboardProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Controlled mode: parent manages open/close state
  if (isOpen !== undefined) {
    if (!isOpen) return null;
    return (
      <KeyboardPanel
        onInsert={onInsert}
        onBackspace={onBackspace}
        onClose={onClose ?? (() => {})}
      />
    );
  }

  // Uncontrolled mode: self-managed toggle (backward compatible)
  if (!internalOpen) {
    return (
      <button
        type="button"
        onClick={() => setInternalOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--phase-color)] bg-[var(--sand)] hover:bg-[var(--phase-color)] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        <Keyboard size={14} />
        Arabic Keyboard
      </button>
    );
  }

  return (
    <KeyboardPanel
      onInsert={onInsert}
      onBackspace={onBackspace}
      onClose={() => setInternalOpen(false)}
    />
  );
}
