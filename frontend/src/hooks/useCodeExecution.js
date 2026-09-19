import { useState } from "react";
import { runQuestionTestCases } from "../services/testRunnerService";

export const INITIAL_EXECUTION_RESULT = {
  status: "idle",
  output: "",
  error: "",
  executionTime: null,
};

/**
 * Custom hook that encapsulates execution state, idle/running transitions,
 * empty editor validation, and interaction with testRunnerService.
 */
export function useCodeExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(INITIAL_EXECUTION_RESULT);

  const clearExecutionResult = () => {
    setExecutionResult(INITIAL_EXECUTION_RESULT);
  };

  const runSolution = async ({
    question,
    language,
    sourceCode,
    customInput = "",
    activeLanguageName = "",
    isLocked = false,
  }) => {
    if (isLocked || isRunning) {
      return;
    }

    if (!sourceCode || sourceCode.trim() === "") {
      setExecutionResult({
        status: "error",
        error: "Editor is empty. Please write your solution before running.",
        output: "",
        executionTime: null,
      });
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const result = await runQuestionTestCases({
        question,
        language,
        sourceCode,
        customInput,
        activeLanguageName,
      });
      setExecutionResult(result);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    executionResult,
    runSolution,
    clearExecutionResult,
    setExecutionResult,
  };
}
