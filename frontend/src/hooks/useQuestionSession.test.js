import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useQuestionSession } from "./useQuestionSession";

const mockQuestions = [
  {
    id: "q1",
    title: "Question 1",
    starterCodes: {
      java: "class Solution1 {}",
      python: "class Solution1:\n    pass",
    },
  },
  {
    id: "q2",
    title: "Question 2",
    starterCodes: {
      java: "class Solution2 {}",
      python: "class Solution2:\n    pass",
    },
  },
];

describe("useQuestionSession", () => {
  it("initializes with default question 0 and java", () => {
    const { result } = renderHook(() => useQuestionSession(mockQuestions));

    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.currentQuestion.id).toBe("q1");
    expect(result.current.selectedLanguage).toBe("java");
    expect(result.current.activeLanguageName).toBe("Java");
    expect(result.current.currentCode).toBe("class Solution1 {}");
    expect(result.current.isFirstQuestion).toBe(true);
    expect(result.current.isLastQuestion).toBe(false);
    expect(result.current.hasQuestions).toBe(true);
  });

  it("navigates forward and backward between questions within bounds", () => {
    const { result } = renderHook(() => useQuestionSession(mockQuestions));

    // Previous on first question should do nothing
    act(() => {
      const moved = result.current.goToPreviousQuestion();
      expect(moved).toBe(false);
    });
    expect(result.current.currentQuestionIndex).toBe(0);

    // Next question
    act(() => {
      const moved = result.current.goToNextQuestion();
      expect(moved).toBe(true);
    });
    expect(result.current.currentQuestionIndex).toBe(1);
    expect(result.current.currentQuestion.id).toBe("q2");
    expect(result.current.isFirstQuestion).toBe(false);
    expect(result.current.isLastQuestion).toBe(true);

    // Next on last question should do nothing
    act(() => {
      const moved = result.current.goToNextQuestion();
      expect(moved).toBe(false);
    });
    expect(result.current.currentQuestionIndex).toBe(1);

    // Previous question
    act(() => {
      const moved = result.current.goToPreviousQuestion();
      expect(moved).toBe(true);
    });
    expect(result.current.currentQuestionIndex).toBe(0);
  });

  it("updates and stores code isolated by question and language", () => {
    const { result } = renderHook(() => useQuestionSession(mockQuestions));

    act(() => {
      result.current.updateCode("modified java code q1");
    });
    expect(result.current.currentCode).toBe("modified java code q1");

    // Switch to python on q1
    act(() => {
      result.current.changeLanguage("python");
    });
    expect(result.current.currentCode).toBe("class Solution1:\n    pass");

    act(() => {
      result.current.updateCode("modified python code q1");
    });
    expect(result.current.currentCode).toBe("modified python code q1");

    // Switch back to java on q1 - should retain modified code
    act(() => {
      result.current.changeLanguage("java");
    });
    expect(result.current.currentCode).toBe("modified java code q1");
  });

  it("manages custom input per question", () => {
    const { result } = renderHook(() => useQuestionSession(mockQuestions));

    act(() => {
      result.current.updateCustomInput("input for q1");
    });
    expect(result.current.currentCustomInput).toBe("input for q1");

    // Event object simulation (like e.target.value)
    act(() => {
      result.current.updateCustomInput({ target: { value: "event input for q1" } });
    });
    expect(result.current.currentCustomInput).toBe("event input for q1");

    act(() => {
      result.current.goToNextQuestion();
    });
    expect(result.current.currentCustomInput).toBe("");
  });

  it("manages selected test case index per question", () => {
    const { result } = renderHook(() => useQuestionSession(mockQuestions));

    expect(result.current.selectedCaseIndex).toBe(0);

    act(() => {
      result.current.selectCase(2);
    });
    expect(result.current.selectedCaseIndex).toBe(2);

    act(() => {
      result.current.goToNextQuestion();
    });
    expect(result.current.selectedCaseIndex).toBe(0);
  });

  it("gracefully handles empty questions array", () => {
    const { result } = renderHook(() => useQuestionSession([]));

    expect(result.current.hasQuestions).toBe(false);
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.currentCode).toBe("");
  });
});
