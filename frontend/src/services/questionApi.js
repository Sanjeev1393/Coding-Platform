import { getApiUrl } from "./apiConfig";

const QUESTIONS_URL = getApiUrl("/api/v1/questions");

/**
 * Fetches assessment questions dynamically from the backend REST API (`GET /api/v1/questions`).
 * Returns the backend question definitions with sanitized visible test cases.
 * Returns an empty array `[]` if the network request fails or if the response is empty.
 *
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel in-flight HTTP request on unmount or retry
 * @returns {Promise<Array<Object>>} List of question definitions, or empty array on failure
 */
export async function fetchQuestions(signal) {
  try {
    const response = signal
      ? await fetch(QUESTIONS_URL, { signal })
      : await fetch(QUESTIONS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch questions: HTTP ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return [];
  } catch (err) {
    if (err?.name === "AbortError") {
      return [];
    }
    console.warn("Unable to fetch questions from server:", err?.message || err);
    return [];
  }
}
