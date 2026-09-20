import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQuestions } from "./useQuestions";
import * as questionApi from "../services/questionApi";
import { mockQuestions } from "../__tests__/mockQuestions";

describe("useQuestions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with initialQuestions immediately if provided", () => {
    vi.spyOn(questionApi, "fetchQuestions").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    const { result } = renderHook(() => useQuestions(mockQuestions));
    expect(result.current.questions).toEqual(mockQuestions);
    expect(result.current.isLoading).toBe(true);
  });

  it("updates questions state when backend fetch resolves", async () => {
    const mockBackendQuestions = [
      { id: "backend-1", title: "Backend Loaded Question" },
    ];

    vi.spyOn(questionApi, "fetchQuestions").mockResolvedValue(
      mockBackendQuestions
    );

    const { result } = renderHook(() => useQuestions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.questions).toEqual(mockBackendQuestions);
    expect(result.current.error).toBeNull();
  });

  it("retries fetching until questions are received on subsequent attempt", async () => {
    const mockBackendQuestions = [
      { id: "backend-2", title: "Retried Question" },
    ];

    let callCount = 0;
    vi.spyOn(questionApi, "fetchQuestions").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return []; // first attempt fails/empty
      }
      return mockBackendQuestions; // second attempt succeeds
    });

    const { result } = renderHook(() =>
      useQuestions([], { retryIntervalMs: 40, maxRetryTimeoutMs: 500 })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(callCount).toBeGreaterThanOrEqual(2);
    expect(result.current.questions).toEqual(mockBackendQuestions);
    expect(result.current.error).toBeNull();
  });

  it("logs console.error and sets error state when retry timeout expires", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(questionApi, "fetchQuestions").mockResolvedValue([]);

    const { result } = renderHook(() =>
      useQuestions([], { retryIntervalMs: 25, maxRetryTimeoutMs: 60 })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 2000 }
    );

    expect(result.current.error).toBeInstanceOf(Error);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("cancels pending retry timeout on unmount", async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    vi.spyOn(questionApi, "fetchQuestions").mockResolvedValue([]);

    const { unmount } = renderHook(() =>
      useQuestions([], { retryIntervalMs: 100, maxRetryTimeoutMs: 1000 })
    );

    // Wait until initial fetch finishes and schedules the retry timeout
    await waitFor(() => {
      expect(setTimeoutSpy).toHaveBeenCalled();
    });

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
