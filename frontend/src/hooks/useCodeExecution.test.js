import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCodeExecution, INITIAL_EXECUTION_RESULT } from "./useCodeExecution";
import * as testRunnerService from "../services/testRunnerService";

vi.mock("../services/testRunnerService", () => ({
  runQuestionTestCases: vi.fn(),
}));

describe("useCodeExecution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with isRunning false and idle executionResult", () => {
    const { result } = renderHook(() => useCodeExecution());

    expect(result.current.isRunning).toBe(false);
    expect(result.current.executionResult).toEqual(INITIAL_EXECUTION_RESULT);
  });

  it("sets error when sourceCode is empty or only whitespace", async () => {
    const { result } = renderHook(() => useCodeExecution());

    await act(async () => {
      await result.current.runSolution({
        question: { id: "q1" },
        language: "java",
        sourceCode: "   ",
      });
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.executionResult.status).toBe("error");
    expect(result.current.executionResult.error).toContain("Editor is empty");
    expect(testRunnerService.runQuestionTestCases).not.toHaveBeenCalled();
  });

  it("does not run when isLocked is true", async () => {
    const { result } = renderHook(() => useCodeExecution());

    await act(async () => {
      await result.current.runSolution({
        question: { id: "q1" },
        language: "java",
        sourceCode: "class Solution {}",
        isLocked: true,
      });
    });

    expect(result.current.isRunning).toBe(false);
    expect(testRunnerService.runQuestionTestCases).not.toHaveBeenCalled();
  });

  it("executes solution and stores the result", async () => {
    const mockOutput = {
      status: "accepted",
      verdict: "ACCEPTED",
      passedCount: 2,
      totalCount: 2,
    };
    vi.mocked(testRunnerService.runQuestionTestCases).mockResolvedValueOnce(mockOutput);

    const { result } = renderHook(() => useCodeExecution());

    await act(async () => {
      await result.current.runSolution({
        question: { id: "q1" },
        language: "java",
        sourceCode: "class Solution {}",
      });
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.executionResult).toEqual(mockOutput);
  });

  it("resets executionResult when clearExecutionResult is called", () => {
    const { result } = renderHook(() => useCodeExecution());

    act(() => {
      result.current.setExecutionResult({ status: "accepted" });
    });
    expect(result.current.executionResult.status).toBe("accepted");

    act(() => {
      result.current.clearExecutionResult();
    });
    expect(result.current.executionResult).toEqual(INITIAL_EXECUTION_RESULT);
  });
});
