const EXECUTIONS_URL = "/api/v1/executions";

/**
 * Sends code to the backend for single execution (Run Code).
 *
 * @param {Object} payload
 * @param {string} payload.language - Language identifier (e.g. 'java')
 * @param {string} payload.sourceCode - Candidate source code
 * @param {string} [payload.stdin] - Custom standard input
 * @param {Object} [payload.signature] - Question signature metadata
 * @param {string} [payload.sampleInput] - Sample input representation
 * @returns {Promise<Object>} Execution response with stdout, stderr, and timings
 */
export async function executeCode(payload) {
  const response = await fetch(EXECUTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Execution request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody.detail || errorBody.message || message;
    } catch {
      // The backend did not return a JSON error body.
    }

    throw new Error(message);
  }

  return response.json();
}

const SUBMISSIONS_URL = "/api/v1/executions/submit";

/**
 * Submits solution code to the backend judging engine (Submit Solution).
 * Evaluates the code against all visible and hidden server-side test cases.
 *
 * @param {Object} payload
 * @param {string} payload.questionId - Unique question ID (e.g. 'two-sum')
 * @param {string} payload.language - Language identifier (e.g. 'java')
 * @param {string} payload.sourceCode - Candidate source code
 * @returns {Promise<Object>} EvaluationResult containing verdict, passed count, and test cases
 */
export async function submitCode(payload) {
  const response = await fetch(SUBMISSIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Submission request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody.detail || errorBody.message || message;
    } catch {
      // The backend did not return a JSON error body.
    }

    throw new Error(message);
  }

  return response.json();
}

