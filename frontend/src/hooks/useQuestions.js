import { useState, useEffect, useCallback } from "react";
import { fetchQuestions } from "../services/questionApi";
import {
  QUESTIONS_RETRY_INTERVAL_MS,
  QUESTIONS_MAX_RETRY_TIMEOUT_MS,
} from "../constants";

/**
 * Custom hook that loads assessment questions dynamically from the backend API.
 * Handles free-tier backend cold starts with interval-based polling and timeout safeguards.
 *
 * @param {Array<Object>} [initialQuestions=[]] - Optional initial questions to seed state
 * @param {Object} [options={}] - Polling configuration options
 * @param {number} [options.retryIntervalMs=QUESTIONS_RETRY_INTERVAL_MS] - Interval between retry attempts in ms
 * @param {number} [options.maxRetryTimeoutMs=QUESTIONS_MAX_RETRY_TIMEOUT_MS] - Maximum duration to keep retrying before erroring
 * @returns {{ questions: Array<Object>, isLoading: boolean, error: Error|null, refetch: () => void }}
 */
export function useQuestions(
  initialQuestions = [],
  {
    retryIntervalMs = QUESTIONS_RETRY_INTERVAL_MS,
    maxRetryTimeoutMs = QUESTIONS_MAX_RETRY_TIMEOUT_MS,
  } = {}
) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setFetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let timeoutId = null;
    const abortController = new AbortController();
    const startTime = Date.now();

    const attemptFetch = async () => {
      try {
        const data = await fetchQuestions(abortController.signal);
        if (isCancelled) return;

        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          setError(null);
          setIsLoading(false);
          return;
        }

        // If no questions returned (e.g. server returned empty or backend was asleep)
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < maxRetryTimeoutMs) {
          timeoutId = setTimeout(attemptFetch, retryIntervalMs);
        } else {
          const timeoutErr = new Error(
            `Failed to load assessment questions from server after ${Math.round(maxRetryTimeoutMs / 1000)}s of retries.`
          );
          console.error(
            "[Assessment] Maximum retry timeout reached while fetching questions from backend:",
            timeoutErr
          );
          setError(timeoutErr);
          setIsLoading(false);
        }
      } catch (err) {
        if (isCancelled || err?.name === "AbortError") return;

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < maxRetryTimeoutMs) {
          timeoutId = setTimeout(attemptFetch, retryIntervalMs);
        } else {
          const formattedErr =
            err instanceof Error ? err : new Error(String(err));
          console.error(
            "[Assessment] Maximum retry timeout reached while fetching questions from backend:",
            formattedErr
          );
          setError(formattedErr);
          setIsLoading(false);
        }
      }
    };

    attemptFetch();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      abortController.abort();
    };
  }, [fetchTrigger, retryIntervalMs, maxRetryTimeoutMs]);

  return { questions, isLoading, error, refetch };
}
