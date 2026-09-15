import { useEffect, useRef } from "react";

/**
 * Detects whether the current platform is macOS.
 * Falls back gracefully to false in non-browser or SSR environments.
 */
export const isMacPlatform = () => {
  if (typeof navigator === "undefined") return false;
  const platform =
    navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || "";
  return /Mac|iPhone|iPod|iPad/i.test(platform);
};

/**
 * Custom hook that binds cross-platform keyboard shortcuts for code execution and submission.
 *
 * Supported shortcuts:
 * - Run Code: Ctrl + Enter (Windows / Linux) or ⌘ + Enter (macOS)
 * - Submit Solution: Ctrl + Shift + Enter (Windows / Linux) or ⌘ + Shift + Enter (macOS)
 *
 * @param {Object} options
 * @param {Function} options.onRunCode - Callback executed when the Run shortcut is triggered.
 * @param {Function} options.onSubmit - Callback executed when the Submit shortcut is triggered.
 * @param {boolean} [options.disabled=false] - When true, shortcut callbacks will not fire.
 * @param {EventTarget} [options.target] - Target to bind listener to (defaults to window).
 */
export function useKeyboardShortcuts({
  onRunCode,
  onSubmit,
  disabled = false,
  target,
}) {
  // Store callbacks in a ref to avoid stale closure issues without constantly
  // tearing down and re-binding the window event listener on every re-render.
  const handlerRef = useRef({ onRunCode, onSubmit, disabled });

  useEffect(() => {
    handlerRef.current = { onRunCode, onSubmit, disabled };
  });

  useEffect(() => {
    const eventTarget = target ?? (typeof window !== "undefined" ? window : null);
    if (!eventTarget) return;

    const handleKeyDown = (event) => {
      // Both Ctrl (Windows/Linux) and Meta/Cmd (macOS) are treated as valid shortcut modifiers
      const isModifier = event.ctrlKey || event.metaKey;

      if (!isModifier || event.key !== "Enter" || event.altKey) {
        return;
      }

      // Prevent inserting unwanted newlines in textareas or triggering browser defaults
      event.preventDefault();

      const { onRunCode: run, onSubmit: submit, disabled: isDisabled } =
        handlerRef.current;

      if (isDisabled) return;

      if (event.shiftKey) {
        if (typeof submit === "function") {
          submit();
        }
      } else {
        if (typeof run === "function") {
          run();
        }
      }
    };

    eventTarget.addEventListener("keydown", handleKeyDown);
    return () => {
      eventTarget.removeEventListener("keydown", handleKeyDown);
    };
  }, [target]);
}
