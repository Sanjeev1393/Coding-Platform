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
});
