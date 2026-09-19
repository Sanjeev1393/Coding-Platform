import { useState } from "react";
import {
  runQuestionTestCases,
  submitQuestionSolution,
} from "../services/testRunnerService";

/**
 * Initial empty execution state when no execution has been performed yet.
 */
export const INITIAL_EXECUTION_RESULT = {
  status: "idle",
  output: "",
  error: "",
  executionTime: null,
};

/**
 * Custom hook that encapsulates code execution and automated submission states,
 * managing busy/running/submitting transitions, empty editor validation, and
 * per-question submission result caching.
 *
 * @returns {Object} Execution controls and state:
 * - `isRunning`: boolean indicating whether running or submitting is in progress
 * - `isRunningCode`: boolean indicating single Run Code execution
 * - `isSubmitting`: boolean indicating full Submit Solution evaluation
 * - `executionResult`: current execution outcome (null while running)
 * - `submissionsByQuestion`: dictionary mapping question ID to its latest evaluation result
 * - `runSolution`: executes solution against visible test cases or custom input
 * - `submitSolution`: evaluates solution against full server test suite
 * - `clearExecutionResult`: resets execution result to idle
 * - `setExecutionResult`: setter for execution result
 * - `setSubmissionsByQuestion`: setter for submissions dictionary
 */
export function useCodeExecution() {
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(INITIAL_EXECUTION_RESULT);
  const [submissionsByQuestion, setSubmissionsByQuestion] = useState({});

  const isBusy = isRunningCode || isSubmitting;

  /**
   * Resets execution result back to the idle default state.
   */
  const clearExecutionResult = () => {
    setExecutionResult(INITIAL_EXECUTION_RESULT);
  };

  /**
   * Executes candidate code against visible test cases or custom stdin (Run Code).
   *
   * @param {Object} params
   * @param {Object} params.question - Active question domain definition
   * @param {string} params.language - Language ID (e.g. 'java')
   * @param {string} params.sourceCode - Candidate source code string
   * @param {string} [params.customInput=""] - Optional custom standard input
   * @param {string} [params.activeLanguageName=""] - Display name of active language
   * @param {boolean} [params.isLocked=false] - True if editor is locked (e.g. timeout or submitted)
   */
  const runSolution = async ({
    question,
    language,
    sourceCode,
    customInput = "",
    activeLanguageName = "",
    isLocked = false,
  }) => {
    if (isLocked || isBusy) {
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

    setIsRunningCode(true);
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
      setIsRunningCode(false);
    }
  };

  /**
   * Evaluates candidate code against the full server test suite (Submit Solution).
   *
   * @param {Object} params
   * @param {Object} params.question - Active question domain definition
   * @param {string} params.language - Language ID (e.g. 'java')
   * @param {string} params.sourceCode - Candidate source code string
   * @param {string} [params.activeLanguageName=""] - Display name of active language
   * @param {boolean} [params.isLocked=false] - True if editor is locked
   */
  const submitSolution = async ({
    question,
    language,
    sourceCode,
    activeLanguageName = "",
    isLocked = false,
  }) => {
    if (isLocked || isBusy) {
      return;
    }

    if (!sourceCode || sourceCode.trim() === "") {
      setExecutionResult({
        status: "error",
        error: "Editor is empty. Please write your solution before submitting.",
        output: "",
        executionTime: null,
      });
      return;
    }

    setIsSubmitting(true);
    setExecutionResult(null);

    try {
      const result = await submitQuestionSolution({
        question,
        language,
        sourceCode,
        activeLanguageName,
      });
      setExecutionResult(result);
      if (question?.id) {
        setSubmissionsByQuestion((prev) => ({
          ...prev,
          [question.id]: result,
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isRunning: isBusy,
    isRunningCode,
    isSubmitting,
    executionResult,
    submissionsByQuestion,
    runSolution,
    submitSolution,
    clearExecutionResult,
    setExecutionResult,
    setSubmissionsByQuestion,
  };
}
