import { executeCode, submitCode } from "./executionApi";
import { validateResult } from "../utils/resultValidator";

/**
 * Executes a question against either its visible test cases or a single custom input.
 * Aggregates runtime/memory metrics, bails early on compilation or runtime errors,
 * and validates results using question validator rules.
 *
 * @param {Object} params
 * @param {Object} params.question - Active question metadata
 * @param {string} params.language - Language ID (e.g. 'java')
 * @param {string} params.sourceCode - Solution source code
 * @param {string} [params.customInput=""] - Custom stdin if running without predefined test cases
 * @param {string} [params.activeLanguageName=""] - Display name of the active language
 * @returns {Promise<Object>} Formatted execution result
 */
export async function runQuestionTestCases({
  question,
  language,
  sourceCode,
  customInput = "",
  activeLanguageName = "",
}) {
  const visibleCases = question?.testCases?.visible;
  const validatorType = question?.validator?.type || "exact";
  const displayLanguage = activeLanguageName || language;

  try {
    if (visibleCases && visibleCases.length > 0) {
      const evaluatedCases = [];
      let totalExecutionTime = 0;
      let maxMemoryKb = 0;
      let compilationError = null;
      let runtimeError = null;

      for (const tc of visibleCases) {
        const result = await executeCode({
          language,
          sourceCode,
          stdin: tc.rawInput,
          signature: question?.signature,
          sampleInput: question?.sampleInput,
        });

        if (result.compilationOutput) {
          compilationError = result.compilationOutput;
          break;
        }

        if (result.stderr) {
          runtimeError = result.stderr;
          break;
        }

        totalExecutionTime += result.executionTimeMs || 0;
        if (result.memoryKb && result.memoryKb > maxMemoryKb) {
          maxMemoryKb = result.memoryKb;
        }

        const cleanStdout = (result.stdout || "").trim();
        const passed =
          !result.stderr &&
          validateResult(cleanStdout, tc.expectedOutput, validatorType);

        evaluatedCases.push({
          id: tc.id,
          name: tc.name,
          passed,
          inputs: tc.inputs,
          output: cleanStdout,
          expected: tc.expectedOutput,
        });
      }

      if (compilationError) {
        return {
          status: "error",
          errorType: "compilation",
          error: compilationError,
          language: displayLanguage,
        };
      }

      if (runtimeError) {
        return {
          status: "error",
          errorType: "runtime",
          error: runtimeError,
          language: displayLanguage,
        };
      }

      const allPassed =
        evaluatedCases.length > 0 && evaluatedCases.every((c) => c.passed);
      const passedCount = evaluatedCases.filter((c) => c.passed).length;

      return {
        status: allPassed ? "accepted" : "wrong_answer",
        verdict: allPassed ? "ACCEPTED" : "WRONG_ANSWER",
        passedCount,
        totalCount: evaluatedCases.length,
        cases: evaluatedCases,
        executionTime: totalExecutionTime,
        memoryKb: maxMemoryKb,
        language: displayLanguage,
      };
    }

    // Single run fallback (custom input mode)
    const result = await executeCode({
      language,
      sourceCode,
      stdin: customInput,
      signature: question?.signature,
      sampleInput: question?.sampleInput,
    });

    const errorType = result.compilationOutput
      ? "compilation"
      : result.stderr
        ? "runtime"
        : "error";

    return {
      status: result.status === "SUCCESS" ? "success" : "error",
      errorType,
      output: result.stdout,
      error: result.compilationOutput || result.stderr,
      executionTime: result.executionTimeMs,
      memoryKb: result.memoryKb,
      language: displayLanguage,
      input: customInput,
      isMock: false,
    };
  } catch (error) {
    return {
      status: "error",
      output: "",
      error:
        error instanceof Error
          ? error.message
          : "Unable to connect to the execution service",
    };
  }
}

/**
 * Submits a question solution to the backend EvaluationService for automated judging.
 * Evaluates visible and hidden test cases, returning granular results and overall verdict.
 *
 * @param {Object} params
 * @param {Object} params.question - Active question metadata
 * @param {string} params.language - Language ID (e.g. 'java')
 * @param {string} params.sourceCode - Solution source code
 * @param {string} [params.activeLanguageName=""] - Display name of the active language
 * @returns {Promise<Object>} Formatted evaluation result
 */
export async function submitQuestionSolution({
  question,
  language,
  sourceCode,
  activeLanguageName = "",
}) {
  const displayLanguage = activeLanguageName || language;

  try {
    const result = await submitCode({
      questionId: question.id,
      language,
      sourceCode,
    });

    if (result.status === "COMPILATION_ERROR") {
      return {
        status: "error",
        errorType: "compilation",
        error: result.errorMessage || "Compilation failed.",
        language: displayLanguage,
        isSubmission: true,
      };
    }

    if (
      result.status === "RUNTIME_ERROR" &&
      result.passed === 0 &&
      (!result.testCases || result.testCases.length === 0)
    ) {
      return {
        status: "error",
        errorType: "runtime",
        error: result.errorMessage || "Runtime error occurred.",
        language: displayLanguage,
        isSubmission: true,
      };
    }

    const evaluatedCases = (result.testCases || []).map((tc) => ({
      id: tc.id,
      name: tc.name,
      passed: tc.status === "PASSED",
      hidden: Boolean(tc.hidden),
      inputs: tc.input,
      output: tc.actualOutput,
      expected: tc.expectedOutput,
      status: tc.status,
    }));

    const isAccepted = result.status === "SUCCESS";

    return {
      status: isAccepted ? "accepted" : "wrong_answer",
      verdict: isAccepted ? "ACCEPTED" : result.status,
      passedCount: result.passed,
      totalCount: result.total,
      cases: evaluatedCases,
      executionTime: result.totalExecutionTimeMs,
      memoryKb: result.maxMemoryKb,
      language: displayLanguage,
      isSubmission: true,
    };
  } catch (error) {
    return {
      status: "error",
      output: "",
      error:
        error instanceof Error
          ? error.message
          : "Unable to connect to the evaluation service",
      isSubmission: true,
    };
  }
}

