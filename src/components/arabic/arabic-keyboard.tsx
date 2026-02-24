"use client";

import { useState } from "react";
import { Keyboard, X } from "lucide-react";

interface ArabicKeyboardProps {
  onInsert: (char: string) => void;
  onBackspace: () => void;
}

const ROWS = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
  ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"],
];

const DIACRITICS = ["َ", "ُ", "ِ", "ّ", "ْ", "ً", "ٌ", "ٍ"];

export function ArabicKeyboard({ onInsert, onBackspace }: ArabicKeyboardProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--phase-color)] bg-[var(--sand)] hover:bg-[var(--phase-color)] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        <Keyboard size={14} />
        Arabic Keyboard
      </button>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--sand)] rounded-xl shadow-lg p-3 mt-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
          Arabic Keyboard
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
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
                className="px-3 h-9 sm:h-10 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold transition-colors"
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
            className="w-8 h-8 bg-[#fdf8ee] hover:bg-[var(--gold)] hover:text-white rounded-md text-lg font-[Noto_Naskh_Arabic,serif] transition-colors flex items-center justify-center"
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
