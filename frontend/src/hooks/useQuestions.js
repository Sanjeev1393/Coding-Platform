import { useState, useEffect } from "react";
import { fetchQuestions } from "../services/questionApi";

/**
 * Custom hook that loads assessment questions dynamically from the backend API.
 *
 * @param {Array<Object>} [initialQuestions=[]] - Optional initial questions to seed state
 * @returns {{ questions: Array<Object>, isLoading: boolean, error: Error|null }}
 */
export function useQuestions(initialQuestions = []) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isLoading, setIsLoading] = useState(initialQuestions.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchQuestions();
        if (!isCancelled) {
          if (Array.isArray(data) && data.length > 0) {
            setQuestions(data);
          }
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadQuestions();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { questions, isLoading, error };
}
