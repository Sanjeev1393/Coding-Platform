import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "../constants";
import {
  getStarterCode,
  buildQuestionLanguageKey,
} from "../utils/languageUtils";

/**
 * Custom hook that manages question navigation, multi-language solutions,
 * custom inputs, and active test case tabs.
 *
 * @param {Array<Object>} [questions=[]] - List of assessment questions
 * @param {string} [initialLanguage="java"] - Initial language ID
 */
export function useQuestionSession(questions = [], initialLanguage = "java") {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [solutionsByKey, setSolutionsByKey] = useState({});
  const [customInputsByQuestion, setCustomInputsByQuestion] = useState({});
  const [selectedCaseIndexByQuestion, setSelectedCaseIndexByQuestion] = useState({});

  // Derived values
  const hasQuestions = questions.length > 0;
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = hasQuestions && currentQuestionIndex === questions.length - 1;

  const currentKey = currentQuestion
    ? buildQuestionLanguageKey(currentQuestion.id, selectedLanguage)
    : "";

  const currentCode = currentQuestion
    ? (solutionsByKey[currentKey] ??
      getStarterCode(currentQuestion, selectedLanguage))
    : "";

  const currentCustomInput = currentQuestion
    ? (customInputsByQuestion[currentQuestion.id] ?? "")
    : "";

  const selectedCaseIndex = currentQuestion
    ? (selectedCaseIndexByQuestion[currentQuestion.id] ?? 0)
    : 0;

  const activeLanguageConfig = SUPPORTED_LANGUAGES.find(
    (lang) => lang.id === selectedLanguage
  );
  const activeLanguageName = activeLanguageConfig?.name || selectedLanguage;

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      return true;
    }
    return false;
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return true;
    }
    return false;
  };

  const changeLanguage = (newLanguage) => {
    setSelectedLanguage(newLanguage);
  };

  const updateCode = (newCode) => {
    if (!currentQuestion) return;
    const key = buildQuestionLanguageKey(currentQuestion.id, selectedLanguage);
    setSolutionsByKey((prev) => ({
      ...prev,
      [key]: newCode,
    }));
  };

  const updateCustomInput = (eventOrValue) => {
    if (!currentQuestion) return;
    const nextVal =
      typeof eventOrValue === "string"
        ? eventOrValue
        : eventOrValue?.target?.value ?? "";
    setCustomInputsByQuestion((prev) => ({
      ...prev,
      [currentQuestion.id]: nextVal,
    }));
  };

  const selectCase = (index) => {
    if (!currentQuestion) return;
    setSelectedCaseIndexByQuestion((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));
  };

  return {
    currentQuestionIndex,
    currentQuestion,
    selectedLanguage,
    activeLanguageName,
    currentCode,
    currentCustomInput,
    selectedCaseIndex,
    isFirstQuestion,
    isLastQuestion,
    hasQuestions,
    goToPreviousQuestion,
    goToNextQuestion,
    changeLanguage,
    updateCode,
    updateCustomInput,
    selectCase,
  };
}
