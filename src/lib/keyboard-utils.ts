/**
 * Cursor-aware insertion and deletion utilities for the Arabic virtual keyboard.
 * These work with any <input> or <textarea> ref to insert/delete at the cursor
 * position rather than always appending to the end.
 */

type InputRef = React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;

/**
 * Insert a character at the current cursor position (or end if no ref/selection).
 */
export function insertAtCursor(
  ref: InputRef | undefined,
  currentValue: string,
  char: string
): { newValue: string; cursorPos: number } {
  const el = ref?.current;
  if (!el || el.selectionStart == null) {
    // Fallback: append to end
    return { newValue: currentValue + char, cursorPos: currentValue.length + char.length };
  }

  const start = el.selectionStart;
  const end = el.selectionEnd ?? start;
  const before = currentValue.slice(0, start);
  const after = currentValue.slice(end);
  const newValue = before + char + after;
  const cursorPos = start + char.length;

  return { newValue, cursorPos };
}

/**
 * Delete one character before the cursor position (or from end if no ref/selection).
 */
export function backspaceAtCursor(
  ref: InputRef | undefined,
  currentValue: string
): { newValue: string; cursorPos: number } {
  const el = ref?.current;
  if (!el || el.selectionStart == null) {
    // Fallback: remove last character
    return { newValue: currentValue.slice(0, -1), cursorPos: Math.max(0, currentValue.length - 1) };
  }

  const start = el.selectionStart;
  const end = el.selectionEnd ?? start;

  // If there's a selection, delete the selection
  if (start !== end) {
    const before = currentValue.slice(0, start);
    const after = currentValue.slice(end);
    return { newValue: before + after, cursorPos: start };
  }

  // No selection — delete one character before cursor
  if (start === 0) {
    return { newValue: currentValue, cursorPos: 0 };
  }

  const before = currentValue.slice(0, start - 1);
  const after = currentValue.slice(start);
  return { newValue: before + after, cursorPos: start - 1 };
}

/**
 * Restore cursor position after a React state update.
 * Must be called inside requestAnimationFrame to run after React re-render.
 */
export function restoreCursor(
  ref: InputRef | undefined,
  cursorPos: number
): void {
  requestAnimationFrame(() => {
    const el = ref?.current;
    if (el) {
      el.setSelectionRange(cursorPos, cursorPos);
      el.focus();
    }
  });
}
