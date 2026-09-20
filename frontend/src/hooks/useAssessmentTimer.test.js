import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useAssessmentTimer } from "./useAssessmentTimer";

const ONE_SECOND = 1000;

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Advances Vitest fake timers by `n` seconds, wrapping each tick in its own
 * act() call. This is required because useAssessmentTimer uses the pattern:
 *
 *   useEffect(() => { setTimeout(...) }, [timeLeft])
 *
 * Each setTimeout only schedules the *next* tick after React flushes the
 * previous state update. A single act() + advanceTimersByTime(n * 1000) fires
 * only the first pending timeout, then stops. We must flush state after every
 * tick so the next timeout is registered before we advance the clock again.
 */
function advanceSeconds(n) {
  for (let i = 0; i < n; i++) {
    act(() => {
      vi.advanceTimersByTime(ONE_SECOND);
    });
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useAssessmentTimer", () => {
  // Restore real timers after every test so that leaked fakes do not affect
  // other test files (e.g. QuestionPanel.test.jsx).
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── core timer behaviour ──────────────────────────────────────────────

  describe("core timer behaviour", () => {
    test("shows 30:00 on initial render for a 30-minute duration", () => {
      const { result } = renderHook(() => useAssessmentTimer(30 * 60));

      expect(result.current.formattedTime).toBe("30:00");
      expect(result.current.isTimeUp).toBe(false);
    });

    test("shows 29:59 after advancing one second", () => {
      const { result } = renderHook(() => useAssessmentTimer(30 * 60));

      advanceSeconds(1);

      expect(result.current.formattedTime).toBe("29:59");
    });

    test("shows 29:00 after advancing 60 seconds", () => {
      const { result } = renderHook(() => useAssessmentTimer(30 * 60));

      advanceSeconds(60);

      expect(result.current.formattedTime).toBe("29:00");
    });

    test("shows 00:00 and marks isTimeUp when timer reaches zero", () => {
      const { result } = renderHook(() => useAssessmentTimer(3));

      advanceSeconds(3);

      expect(result.current.formattedTime).toBe("00:00");
      expect(result.current.isTimeUp).toBe(true);
    });

    test("remains at 00:00 and does not go negative after the timer expires", () => {
      const { result } = renderHook(() => useAssessmentTimer(2));

      // Advance well past the expiry point
      advanceSeconds(10);

      expect(result.current.formattedTime).toBe("00:00");
      expect(result.current.isTimeUp).toBe(true);
      expect(result.current.timeLeft).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── edge cases and lifecycle ─────────────────────────────────────────

  describe("edge cases and lifecycle", () => {
    test("decreases only once per second even under React Strict Mode", () => {
      // Strict Mode intentionally double-invokes effects in development.
      // The cleanup (clearTimeout) runs between invocations, ensuring only one
      // live timeout exists at any time, so the timer still decrements by 1.
      const { result } = renderHook(() => useAssessmentTimer(10), {
        wrapper: ({ children }) =>
          React.createElement(React.StrictMode, null, children),
      });

      advanceSeconds(1);

      // 10 - 1 = 9, not 8
      expect(result.current.formattedTime).toBe("00:09");
    });

    test("cancels the scheduled timeout when the component unmounts", () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      const { unmount } = renderHook(() => useAssessmentTimer(30 * 60));
      unmount();

      // The useEffect cleanup must have called clearTimeout at least once
      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    test("timer does not reset when the parent re-renders (simulates question navigation)", () => {
      // useState initializes only on mount; subsequent re-renders do not reset
      // timeLeft, so navigating to a different question leaves the timer intact.
      const { result, rerender } = renderHook(() =>
        useAssessmentTimer(30 * 60)
      );

      advanceSeconds(5);

      expect(result.current.formattedTime).toBe("29:55");

      // Simulate a parent re-render triggered by question navigation
      rerender();

      // Timer must still read 29:55, not jump back to 30:00
      expect(result.current.formattedTime).toBe("29:55");
    });
  });

  // ─── guarded / stopped timer behaviour ────────────────────────────────
  describe("guarded / stopped timer behaviour", () => {
    test("does not decrement or count down when isActive is false", () => {
      const { result } = renderHook(() =>
        useAssessmentTimer(30 * 60, { isActive: false })
      );

      expect(result.current.formattedTime).toBe("30:00");
      expect(result.current.isTimeUp).toBe(false);
      expect(result.current.isUrgent).toBe(false);
      expect(result.current.isTimerActive).toBe(false);

      // Advance clock
      advanceSeconds(30);

      // Time should remain unchanged at 30:00
      expect(result.current.formattedTime).toBe("30:00");
      expect(result.current.isTimeUp).toBe(false);
    });

    test("never marks isTimeUp when isActive is false even if initial duration is 0", () => {
      const { result } = renderHook(() =>
        useAssessmentTimer(0, { isActive: false })
      );

      expect(result.current.isTimeUp).toBe(false);
      expect(result.current.isTimerActive).toBe(false);
    });
  });
});
