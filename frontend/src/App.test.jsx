import { render, screen, fireEvent, act, within } from "@testing-library/react";
import App from "./App";
import { mockQuestions as defaultQuestions } from "./__tests__/mockQuestions";
import { getStarterCode } from "./utils/languageUtils";

// ─── Module Mocking ────────────────────────────────────────────────────────────

let mockQuestions = null;

vi.mock("./services/executionApi", () => ({
  executeCode: vi.fn((payload) => {
    const sourceCode = payload?.sourceCode || "";
    if (sourceCode.includes("// compile-error")) {
      return Promise.resolve({
        status: "ERROR",
        stdout: "",
        compilationOutput: `Solution.java:3: error: ';' expected\n        int target = 9\n                      ^\nSolution.java:5: error: cannot find symbol\n        return new int[]{0, 1}\n                              ^\n2 errors`,
        stderr: "",
        executionTimeMs: 0,
        memoryKb: 0,
      });
    }
    if (sourceCode.includes("// runtime-error")) {
      return Promise.resolve({
        status: "ERROR",
        stdout: "",
        compilationOutput: "",
        stderr: `Exception in thread "main" java.lang.ArithmeticException: / by zero\n\tat Solution.twoSum(Solution.java:4)\n\tat Main.main(Main.java:12)`,
        executionTimeMs: 5,
        memoryKb: 1024,
      });
    }
    if (sourceCode.includes("// wrong-answer")) {
      return Promise.resolve({
        status: "SUCCESS",
        stdout: "[99, 99]",
        compilationOutput: "",
        stderr: "",
        executionTimeMs: 15,
        memoryKb: 2048,
      });
    }
    if (payload?.stdin?.includes("3, 2, 4")) {
      return Promise.resolve({
        status: "SUCCESS",
        stdout: "[1, 2]",
        compilationOutput: "",
        stderr: "",
        executionTimeMs: 15,
        memoryKb: 2048,
      });
    }
    if (payload?.stdin?.includes("world")) {
      return Promise.resolve({
        status: "SUCCESS",
        stdout: '"dlrow"',
        compilationOutput: "",
        stderr: "",
        executionTimeMs: 15,
        memoryKb: 2048,
      });
    }
    if (payload?.stdin?.includes("hello")) {
      return Promise.resolve({
        status: "SUCCESS",
        stdout: '"olleh"',
        compilationOutput: "",
        stderr: "",
        executionTimeMs: 15,
        memoryKb: 2048,
      });
    }
    return Promise.resolve({
      status: "SUCCESS",
      stdout: "[0, 1]",
      compilationOutput: "",
      stderr: "",
      executionTimeMs: 15,
      memoryKb: 2048,
    });
  }),
  submitCode: vi.fn((payload) => {
    const sourceCode = payload?.sourceCode || "";
    if (sourceCode.includes("// compile-error")) {
      return Promise.resolve({
        status: "COMPILATION_ERROR",
        passed: 0,
        total: 4,
        errorMessage: "Solution.java:3: error: ';' expected\n2 errors",
        testCases: [],
      });
    }
    if (sourceCode.includes("// runtime-error")) {
      return Promise.resolve({
        status: "RUNTIME_ERROR",
        passed: 0,
        total: 4,
        errorMessage: "ArithmeticException: / by zero",
        testCases: [],
      });
    }
    if (sourceCode.includes("// wrong-answer")) {
      return Promise.resolve({
        status: "WRONG_ANSWER",
        passed: 2,
        total: 4,
        totalExecutionTimeMs: 40,
        maxMemoryKb: 2048,
        testCases: [
          {
            id: "c-1",
            name: "Example 1",
            status: "PASSED",
            hidden: false,
            input: "[2, 7, 11, 15]\n9",
            expectedOutput: "[0, 1]",
            actualOutput: "[0, 1]",
          },
          {
            id: "c-2",
            name: "Example 2",
            status: "PASSED",
            hidden: false,
            input: "[3, 2, 4]\n6",
            expectedOutput: "[1, 2]",
            actualOutput: "[1, 2]",
          },
          {
            id: "c-3",
            name: "Hidden Case 1",
            status: "FAILED",
            hidden: true,
          },
          {
            id: "c-4",
            name: "Hidden Case 2",
            status: "FAILED",
            hidden: true,
          },
        ],
      });
    }
    return Promise.resolve({
      status: "SUCCESS",
      passed: 4,
      total: 4,
      totalExecutionTimeMs: 45,
      maxMemoryKb: 2048,
      testCases: [
        {
          id: "c-1",
          name: "Example 1",
          status: "PASSED",
          hidden: false,
          input: "[2, 7, 11, 15]\n9",
          expectedOutput: "[0, 1]",
          actualOutput: "[0, 1]",
        },
        {
          id: "c-2",
          name: "Example 2",
          status: "PASSED",
          hidden: false,
          input: "[3, 2, 4]\n6",
          expectedOutput: "[1, 2]",
          actualOutput: "[1, 2]",
        },
        {
          id: "c-3",
          name: "Hidden Case 1",
          status: "PASSED",
          hidden: true,
        },
        {
          id: "c-4",
          name: "Hidden Case 2",
          status: "PASSED",
          hidden: true,
        },
      ],
    });
  }),
}));

vi.mock("./hooks/useQuestions", () => ({
  useQuestions: () => ({
    questions: mockQuestions !== null ? mockQuestions : defaultQuestions,
    isLoading: false,
    error: null,
  }),
}));

// ─── Interaction Strategy ──────────────────────────────────────────────────────
// fireEvent is deliberately used in full-flow integration tests rather than userEvent
// because the assessment countdown timer runs continuously via setTimeout. Pairing
// userEvent's internal asynchronous delays with active fake timers can cause tick
// loops; synchronous fireEvent guarantees deterministic fake-timer advancement.

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ONE_SECOND = 1000;

function advanceSeconds(n) {
  for (let i = 0; i < n; i++) {
    act(() => {
      vi.advanceTimersByTime(ONE_SECOND);
    });
  }
}

async function advanceSecondsAsync(n = 1) {
  for (let i = 0; i < n; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ONE_SECOND);
    });
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("App — full assessment flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockQuestions = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Navigation and question display ─────────────────────────────────────────

  describe("navigation and question display", () => {
    test("initial render: first question and its starter code appear", () => {
      render(<App />);

      expect(
        screen.getByRole("heading", { name: defaultQuestions[0].title })
      ).toBeInTheDocument();
      expect(
        screen.getByText(defaultQuestions[0].description)
      ).toBeInTheDocument();
      expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      expect(editor).toHaveValue(getStarterCode(defaultQuestions[0], "java"));

      expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    });

    test("navigate to next question: second question appears", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      expect(
        screen.getByRole("heading", { name: defaultQuestions[1].title })
      ).toBeInTheDocument();
      expect(
        screen.getByText(defaultQuestions[1].description)
      ).toBeInTheDocument();
      expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      expect(editor).toHaveValue(getStarterCode(defaultQuestions[1], "java"));

      expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });

    test("navigate back: first question appears again", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Previous" }));

      expect(
        screen.getByRole("heading", { name: defaultQuestions[0].title })
      ).toBeInTheDocument();
      expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: "Code editor" })).toHaveValue(
        getStarterCode(defaultQuestions[0], "java")
      );
    });

    test("first-question boundary: Previous cannot move index below zero", () => {
      render(<App />);

      const prevBtn = screen.getByRole("button", { name: "Previous" });
      expect(prevBtn).toBeDisabled();

      fireEvent.click(prevBtn);

      expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: defaultQuestions[0].title })
      ).toBeInTheDocument();
    });

    test("last-question boundary: Next cannot move beyond the array", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();

      const nextBtn = screen.getByRole("button", { name: "Next" });
      expect(nextBtn).toBeDisabled();

      fireEvent.click(nextBtn);

      expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: defaultQuestions[1].title })
      ).toBeInTheDocument();
    });
  });

  // ─── State preservation across navigation ────────────────────────────────────

  describe("state preservation across navigation", () => {
    test("preserve answers: each question retains its own code", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });

      // Edit Question 1 code
      fireEvent.change(editor, {
        target: { value: "// Solution for Two Sum - candidate code" },
      });
      expect(editor).toHaveValue("// Solution for Two Sum - candidate code");

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(editor).toHaveValue(getStarterCode(defaultQuestions[1], "java"));

      // Edit Question 2 code
      fireEvent.change(editor, {
        target: { value: "// Solution for Reverse String - candidate code" },
      });
      expect(editor).toHaveValue(
        "// Solution for Reverse String - candidate code"
      );

      // Navigate back to Question 1: code is preserved
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(editor).toHaveValue("// Solution for Two Sum - candidate code");

      // Navigate forward to Question 2: code is preserved
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(editor).toHaveValue(
        "// Solution for Reverse String - candidate code"
      );
    });

    test("clear execution result on navigation: Question 1 result does not appear on Question 2", async () => {
      render(<App />);

      // Run code on Question 1
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      await advanceSecondsAsync(1);

      // Execution result appears for Question 1
      expect(
        screen.getByText(/✓ Accepted/)
      ).toBeInTheDocument();

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      // Execution result must be cleared (hidden)
      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/✓ Accepted/)
      ).not.toBeInTheDocument();

      // Navigate back to Question 1: result should remain cleared on navigation
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
    });

    test("preserve timer during navigation: timer continues instead of restarting", () => {
      render(<App />);

      const timerDisplay = screen.getByLabelText("Assessment countdown timer");
      expect(timerDisplay).toHaveTextContent("30:00");

      // Elapse 5 seconds on Question 1
      advanceSeconds(5);
      expect(timerDisplay).toHaveTextContent("29:55");

      // Navigate to Question 2: timer must not reset to 30:00
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(timerDisplay).toHaveTextContent("29:55");

      // Elapse another 5 seconds on Question 2
      advanceSeconds(5);
      expect(timerDisplay).toHaveTextContent("29:50");

      // Navigate back to Question 1: timer continues uninterrupted
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(timerDisplay).toHaveTextContent("29:50");
    });
  });

  // ─── Code execution ──────────────────────────────────────────────────────────

  describe("code execution", () => {
    test("testcase tab displays visible test cases and parameters", () => {
      render(<App />);

      // Expand Testcase tab
      fireEvent.click(screen.getByRole("button", { name: /testcase/i }));

      expect(screen.getByRole("tab", { name: "Case 1" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Case 2" })).toBeInTheDocument();
      expect(screen.getByText("nums =")).toBeInTheDocument();
      expect(screen.getByText("target =")).toBeInTheDocument();
    });

    test("each question displays its own test cases across navigation and preserves active case", () => {
      render(<App />);

      // Expand Testcase on Question 1
      fireEvent.click(screen.getByRole("button", { name: /testcase/i }));
      expect(screen.getByText("nums =")).toBeInTheDocument();

      // Switch to Case 2 on Question 1
      fireEvent.click(screen.getByRole("tab", { name: "Case 2" }));
      expect(screen.getByText("[3, 2, 4]")).toBeInTheDocument();

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      // Question 2 should have Question 2's parameters (s =)
      const toggleQ2 = screen.getByRole("button", { name: /testcase/i });
      fireEvent.click(toggleQ2);
      expect(screen.getByText("s =")).toBeInTheDocument();

      // Navigate back to Question 1: Question 1's selected Case 2 is preserved
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      const toggleQ1Back = screen.getByRole("button", { name: /testcase/i });
      fireEvent.click(toggleQ1Back);
      expect(screen.getByText("[3, 2, 4]")).toBeInTheDocument();
    });

    test("output panel is hidden initially until code is executed", () => {
      render(<App />);

      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
    });

    test("clicking Run changes the button to Running.... and disables it", async () => {
      render(<App />);

      const runBtn = screen.getByRole("button", { name: "Run code" });
      fireEvent.click(runBtn);

      const runningBtn = screen.getByRole("button", { name: "Running…" });
      expect(runningBtn).toBeInTheDocument();
      expect(runningBtn).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Code editor" })).toBeDisabled();
      expect(screen.getByText("Executing code…")).toBeInTheDocument();

      await advanceSecondsAsync(1);
    });

    test("accepted output appears after execution with language, test case breakdown, and timing", async () => {
      render(<App />);

      // Run code
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      await advanceSecondsAsync(1);

      // Verify output panel contents
      const resultRegion = screen.getByRole("region", {
        name: "Execution result",
      });
      expect(resultRegion).toBeInTheDocument();
      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
      expect(resultRegion).toHaveTextContent("Java");
      expect(screen.getByText(/Execution time: 30 ms/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Run code" })).toBeEnabled();
    });

    test("wrong answer is flagged when solution returns incorrect output with Expected vs Actual", async () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      fireEvent.change(editor, {
        target: { value: "class Solution { // wrong-answer \n}" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      await advanceSecondsAsync(1);

      const resultRegion = screen.getByRole("region", {
        name: "Execution result",
      });
      expect(within(resultRegion).getByText(/✗ Wrong Answer/)).toBeInTheDocument();
      expect(within(resultRegion).getByText("Your Output")).toBeInTheDocument();
      expect(within(resultRegion).getByText("[99, 99]")).toBeInTheDocument();
      expect(within(resultRegion).getByText("Expected Output")).toBeInTheDocument();
    });

    test("header displays 'DSA Coding Assessment' as test name", () => {
      render(<App />);
      expect(screen.getByText("DSA Coding Assessment")).toBeInTheDocument();
    });

    test("when output appears, user can easily reopen Testcase and view cases", async () => {
      render(<App />);

      // Run code to produce output
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      await advanceSecondsAsync(1);

      // Output appears
      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();

      // User can easily reopen Testcase tab
      const toggleBtn = screen.getByRole("button", { name: /testcase/i });
      expect(toggleBtn).toBeEnabled();
      fireEvent.click(toggleBtn);

      expect(screen.getByRole("tab", { name: "Case 1" })).toBeInTheDocument();
      expect(screen.getByText("nums =")).toBeInTheDocument();
    });

    test("empty code cannot be executed and displays validation error", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      fireEvent.change(editor, { target: { value: "   " } });

      fireEvent.click(screen.getByRole("button", { name: "Run code" }));

      // Error message is displayed, execution is not running
      expect(
        screen.getByText(
          "Editor is empty. Please write your solution before running."
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Running…" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/✓ Accepted/)
      ).not.toBeInTheDocument();
    });

    test("an error result uses the correct error styling", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      fireEvent.change(editor, { target: { value: "" } });

      fireEvent.click(screen.getByRole("button", { name: "Run code" }));

      const resultRegion = screen.getByRole("region", {
        name: "Execution result",
      });
      expect(resultRegion).toHaveClass("bg-red-50");
      expect(screen.getByText("✗ Error")).toBeInTheDocument();
    });

    test("compilation error displays Error badge on tab and Compilation Error inside panel", async () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      fireEvent.change(editor, { target: { value: "int a = 5 // compile-error" } });

      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      await advanceSecondsAsync(1);

      // Tab bar shows Error badge
      const tab = screen.getByRole("button", { name: /test result/i });
      expect(tab).toBeInTheDocument();
      expect(within(tab).getByText("Error")).toBeInTheDocument();

      // Panel inside shows Compilation Error and compiler output
      expect(screen.getByText("✗ Compilation Error")).toBeInTheDocument();
      expect(screen.getByText("Compile-time")).toBeInTheDocument();
      expect(screen.getByText("Compiler error details")).toBeInTheDocument();
      expect(
        screen.getByText(/Solution\.java:3: error: ';' expected/)
      ).toBeInTheDocument();
    });

    test("runtime error displays Error badge on tab and Runtime Error inside panel", async () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      fireEvent.change(editor, { target: { value: "int a = 1 / 0; // runtime-error" } });

      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      await advanceSecondsAsync(1);

      // Tab bar shows Error badge
      const tab = screen.getByRole("button", { name: /test result/i });
      expect(tab).toBeInTheDocument();
      expect(within(tab).getByText("Error")).toBeInTheDocument();

      // Panel inside shows Runtime Error and exception output
      expect(screen.getByText("✗ Runtime Error")).toBeInTheDocument();
      expect(screen.getByText("Runtime")).toBeInTheDocument();
      expect(screen.getByText("Runtime exception details")).toBeInTheDocument();
      expect(screen.getByText(/ArithmeticException: \/ by zero/)).toBeInTheDocument();
    });

    test("previous output is cleared when changing questions", async () => {
      render(<App />);

      // Run code on Question 1
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      await advanceSecondsAsync(1);
      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      // Output should be reset to idle (hidden)
      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/✓ Accepted/)
      ).not.toBeInTheDocument();
    });

    test("previous output is cleared when changing languages", async () => {
      render(<App />);

      // Run code with default language (Java)
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      await advanceSecondsAsync(1);
      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();

      // Change language to Python
      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });
      fireEvent.change(langSelect, { target: { value: "python" } });

      // Output should be reset to idle (hidden)
      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/✓ Accepted/)
      ).not.toBeInTheDocument();
    });

    test(
      "run is unavailable after timeout",
      () => {
        render(<App />);

        // Advance full assessment duration (30 minutes)
        advanceSeconds(1800);

        expect(screen.getByRole("button", { name: "Run code" })).toBeDisabled();
        expect(
          screen.getByRole("button", { name: "Submit solution" })
        ).toBeDisabled();
        expect(
          screen.getByRole("button", { name: /testcase/i })
        ).toBeDisabled();
      },
      30000
    );

    test("run is unavailable after submission", () => {
      render(<App />);

      // Submit assessment
      fireEvent.click(screen.getByRole("button", { name: "Finish Assessment" }));
      fireEvent.click(screen.getByRole("button", { name: "Yes, submit" }));

      expect(screen.getByRole("button", { name: "Run code" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Submit solution" })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /testcase/i })
      ).toBeDisabled();
    });

    test("repeated clicks do not start multiple executions", async () => {
      render(<App />);

      const runBtn = screen.getByRole("button", { name: "Run code" });
      fireEvent.click(runBtn);

      const runningBtn = screen.getByRole("button", { name: "Running…" });
      expect(runningBtn).toBeDisabled();

      // Second click while running
      fireEvent.click(runningBtn);

      await advanceSecondsAsync(1);

      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Run code" })).toBeEnabled();
    });
  });

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────────

  describe("keyboard shortcuts", () => {
    test("Ctrl + Enter executes code (Windows / Linux)", async () => {
      render(<App />);

      fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });

      // Changes to running state
      expect(screen.getByRole("button", { name: "Running…" })).toBeDisabled();

      await advanceSecondsAsync(1);

      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Run code" })).toBeEnabled();
    });

    test("⌘ + Enter executes code (macOS metaKey)", async () => {
      render(<App />);

      fireEvent.keyDown(window, { key: "Enter", metaKey: true });

      expect(screen.getByRole("button", { name: "Running…" })).toBeDisabled();

      await advanceSecondsAsync(1);

      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
    });

    test("Ctrl + Shift + Enter submits solution for automated evaluation", async () => {
      render(<App />);

      fireEvent.keyDown(window, {
        key: "Enter",
        ctrlKey: true,
        shiftKey: true,
      });

      await advanceSecondsAsync(1);

      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
      expect(screen.getByText(/(4 \/ 4 test cases passed)/)).toBeInTheDocument();
    });

    test("⌘ + Shift + Enter submits solution for automated evaluation (macOS)", async () => {
      render(<App />);

      fireEvent.keyDown(window, {
        key: "Enter",
        metaKey: true,
        shiftKey: true,
      });

      await advanceSecondsAsync(1);

      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
    });

    test(
      "shortcuts do not trigger execution or submission when locked or after timeout",
      () => {
        render(<App />);

        // Advance full duration to trigger timeout lock
        advanceSeconds(1800);

        fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
        expect(screen.queryByRole("button", { name: "Running…" })).not.toBeInTheDocument();

        fireEvent.keyDown(window, { key: "Enter", ctrlKey: true, shiftKey: true });
        expect(screen.queryByRole("button", { name: "Submitting…" })).not.toBeInTheDocument();
      },
      15000
    );
  });

  // ─── Submission and Evaluation flow ──────────────────────────────────────────

  describe("submission and evaluation flow", () => {
    test("submitting solution evaluates all test cases and shows granular results", async () => {
      render(<App />);

      fireEvent.click(
        screen.getByRole("button", { name: "Submit solution" })
      );

      await advanceSecondsAsync(1);

      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
      expect(screen.getByText(/(4 \/ 4 test cases passed)/)).toBeInTheDocument();
      expect(screen.getByText("Example 1")).toBeInTheDocument();
      expect(screen.getByText("Hidden Case 1")).toBeInTheDocument();
    });

    test("submitting wrong solution displays Wrong Answer and passed/total count", async () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      fireEvent.change(editor, {
        target: { value: "class Solution { // wrong-answer \n}" },
      });

      fireEvent.click(
        screen.getByRole("button", { name: "Submit solution" })
      );

      await advanceSecondsAsync(1);

      expect(screen.getByText(/✗ Wrong Answer/)).toBeInTheDocument();
      expect(screen.getByText(/(2 \/ 4 test cases passed)/)).toBeInTheDocument();
    });

    test("empty code cannot be submitted and displays validation error", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      fireEvent.change(editor, { target: { value: "   " } });

      fireEvent.click(screen.getByRole("button", { name: "Submit solution" }));

      expect(
        screen.getByText(
          "Editor is empty. Please write your solution before submitting."
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Submitting…" })
      ).not.toBeInTheDocument();
    });

    test("submission result is preserved across question navigation with Solved badge while run output is cleared", async () => {
      render(<App />);

      // Submit solution on Question 1
      fireEvent.click(screen.getByRole("button", { name: "Submit solution" }));
      await advanceSecondsAsync(1);

      // Question 1 displays Accepted verdict and Solved status badge
      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
      expect(screen.getByText("✓ Solved")).toBeInTheDocument();

      // Navigate to Question 2: Question 2 has no submission, output is empty and no Solved badge
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
      expect(screen.queryByRole("region", { name: "Execution result" })).not.toBeInTheDocument();
      expect(screen.queryByText("✓ Solved")).not.toBeInTheDocument();

      // Navigate back to Question 1: Question 1's submission is preserved, Solved badge shown, but console tab starts collapsed
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
      expect(screen.getByText("✓ Solved")).toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();

      // Expanding the Test Result tab reveals the preserved Accepted execution result
      fireEvent.click(screen.getByRole("button", { name: /test result/i }));
      expect(
        screen.getByRole("region", { name: "Execution result" })
      ).toBeInTheDocument();
      expect(screen.getByText(/✓ Accepted/)).toBeInTheDocument();
    });

    test("confirm Finish Assessment: submission-success feedback appears", () => {
      render(<App />);

      fireEvent.click(
        screen.getByRole("button", { name: "Finish Assessment" })
      );

      // Confirm dialog appears
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Submit solution?" })
      ).toBeInTheDocument();

      // Confirm submission
      fireEvent.click(screen.getByRole("button", { name: "Yes, submit" }));

      // Dialog closes and submission success banner appears
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        screen.getByText("✓ Solution submitted successfully.")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Your Java solution has been recorded. You may close this window."
        )
      ).toBeInTheDocument();

      // All interactive elements are locked
      expect(
        screen.getByRole("textbox", { name: "Code editor" })
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Run code" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Submit solution" })
      ).toBeDisabled();
    });

    test("cancel Finish Assessment: submission does not happen", () => {
      render(<App />);

      fireEvent.click(
        screen.getByRole("button", { name: "Finish Assessment" })
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      // Dialog closes
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Submission did not occur
      expect(
        screen.queryByText("✓ Solution submitted successfully.")
      ).not.toBeInTheDocument();

      // Controls remain enabled
      expect(
        screen.getByRole("textbox", { name: "Code editor" })
      ).toBeEnabled();
      expect(screen.getByRole("button", { name: "Run code" })).toBeEnabled();
      expect(
        screen.getByRole("button", { name: "Submit solution" })
      ).toBeEnabled();
    });

    test("click Finish Assessment repeatedly: only one submission dialog is processed", () => {
      render(<App />);

      const finishBtn = screen.getByRole("button", { name: "Finish Assessment" });
      fireEvent.click(finishBtn);

      // Dialog is open
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Clicking finish again while dialog is open does not spawn multiple dialogs
      fireEvent.click(finishBtn);
      expect(screen.getAllByRole("dialog")).toHaveLength(1);

      // Confirm submit
      fireEvent.click(screen.getByRole("button", { name: "Yes, submit" }));

      expect(
        screen.getByText("✓ Solution submitted successfully.")
      ).toBeInTheDocument();

      // Finish button is now disabled (locked)
      expect(finishBtn).toBeDisabled();
      fireEvent.click(finishBtn);

      // No dialog reopens
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("navigate after finishing assessment: entire assessment remains locked", () => {
      render(<App />);

      // Finish assessment on Question 1
      fireEvent.click(
        screen.getByRole("button", { name: "Finish Assessment" })
      );
      fireEvent.click(screen.getByRole("button", { name: "Yes, submit" }));

      expect(
        screen.getByText("✓ Solution submitted successfully.")
      ).toBeInTheDocument();

      // Candidate can still navigate to Question 2 to review their submission
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: defaultQuestions[1].title })
      ).toBeInTheDocument();

      // Business rule: Entire assessment remains locked after submission
      expect(
        screen.getByText("✓ Solution submitted successfully.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: "Code editor" })
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Run code" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Submit solution" })
      ).toBeDisabled();

      // Navigate back to Question 1
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
      expect(
        screen.getByText("✓ Solution submitted successfully.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: "Code editor" })
      ).toBeDisabled();
    });
  });

  // ─── Edge cases and boundaries ───────────────────────────────────────────────

  describe("edge cases and boundaries", () => {
    test("no questions: a useful empty state appears instead of a crash", () => {
      mockQuestions = [];
      render(<App />);

      expect(screen.getByText("No questions available")).toBeInTheDocument();
      expect(
        screen.getByText("No questions are available for this assessment.")
      ).toBeInTheDocument();

      // QuestionPanel and EditorPanel must not be rendered
      expect(
        screen.queryByRole("textbox", { name: "Code editor" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Run code" })
      ).not.toBeInTheDocument();
    });

    test("one question: navigation remains valid and buttons are disabled", () => {
      mockQuestions = [defaultQuestions[0]];
      render(<App />);

      expect(screen.getByText("Question 1 of 1")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: defaultQuestions[0].title })
      ).toBeInTheDocument();

      const prevBtn = screen.getByRole("button", { name: "Previous" });
      const nextBtn = screen.getByRole("button", { name: "Next" });

      expect(prevBtn).toBeDisabled();
      expect(nextBtn).toBeDisabled();
    });

    test(
      "expired timer: run and submit follow the expiry rule",
      () => {
        render(<App />);

      // Advance clock past assessment duration (30 minutes = 1800s)
      advanceSeconds(30 * 60);

      const timerDisplay = screen.getByLabelText("Assessment countdown timer");
      expect(timerDisplay).toHaveTextContent("00:00");

      // Time expired banner is displayed
      expect(screen.getByText("⏳ Time has expired")).toBeInTheDocument();
      expect(
        screen.getByText(
          "The assessment time is up. Code editing and execution have been disabled."
        )
      ).toBeInTheDocument();

      // All action controls are locked
      expect(
        screen.getByRole("textbox", { name: "Code editor" })
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Run code" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Submit solution" })
      ).toBeDisabled();
    }, 15000);
  });

  // ─── Language selection and multi-language support ──────────────────────────

  describe("language selection and multi-language support", () => {
    test("Java is selected initially", () => {
      render(<App />);

      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });
      expect(langSelect).toHaveValue("java");

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      expect(editor).toHaveAttribute("data-language", "java");
      expect(editor).toHaveAttribute("data-path", "question-two-sum.java");
    });

    test("Java starter code is displayed initially", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      expect(editor).toHaveValue(getStarterCode(defaultQuestions[0], "java"));
    });

    test("selecting Python displays Python starter code", () => {
      render(<App />);

      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });
      fireEvent.change(langSelect, { target: { value: "python" } });

      expect(langSelect).toHaveValue("python");
      const editor = screen.getByRole("textbox", { name: "Code editor" });
      expect(editor).toHaveValue(getStarterCode(defaultQuestions[0], "python"));
      expect(editor).toHaveAttribute("data-language", "python");
      expect(editor).toHaveAttribute("data-path", "question-two-sum.py");
    });

    test("selecting JavaScript displays JavaScript starter code", () => {
      render(<App />);

      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });
      fireEvent.change(langSelect, { target: { value: "javascript" } });

      expect(langSelect).toHaveValue("javascript");
      const editor = screen.getByRole("textbox", { name: "Code editor" });
      expect(editor).toHaveValue(
        getStarterCode(defaultQuestions[0], "javascript")
      );
      expect(editor).toHaveAttribute("data-language", "javascript");
      expect(editor).toHaveAttribute("data-path", "question-two-sum.js");
    });

    test("code written in Java is preserved after switching to Python and back", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });

      // Write custom Java code
      const customJavaCode = "public class Solution { /* my custom java */ }";
      fireEvent.change(editor, { target: { value: customJavaCode } });
      expect(editor).toHaveValue(customJavaCode);

      // Switch to Python — shows Python starter code
      fireEvent.change(langSelect, { target: { value: "python" } });
      expect(editor).toHaveValue(getStarterCode(defaultQuestions[0], "python"));

      // Switch back to Java — custom code is preserved
      fireEvent.change(langSelect, { target: { value: "java" } });
      expect(editor).toHaveValue(customJavaCode);
    });

    test("each question stores its own code", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      const customQ1Code = "public class Q1 { /* q1 code */ }";
      fireEvent.change(editor, { target: { value: customQ1Code } });

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(editor).toHaveValue(getStarterCode(defaultQuestions[1], "java"));

      // Edit Question 2 code
      const customQ2Code = "public class Q2 { /* q2 code */ }";
      fireEvent.change(editor, { target: { value: customQ2Code } });
      expect(editor).toHaveValue(customQ2Code);

      // Navigate back to Question 1 — Q1 code is preserved
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(editor).toHaveValue(customQ1Code);
    });

    test("each question-language combination stores separate code", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });

      // Q1 - Java
      fireEvent.change(editor, { target: { value: "// Q1 Java" } });

      // Q1 - Python
      fireEvent.change(langSelect, { target: { value: "python" } });
      fireEvent.change(editor, { target: { value: "# Q1 Python" } });

      // Move to Q2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      // Q2 - Python (retains current language selection)
      expect(langSelect).toHaveValue("python");
      fireEvent.change(editor, { target: { value: "# Q2 Python" } });

      // Q2 - Java
      fireEvent.change(langSelect, { target: { value: "java" } });
      fireEvent.change(editor, { target: { value: "// Q2 Java" } });

      // Verify Q2 Java
      expect(editor).toHaveValue("// Q2 Java");

      // Verify Q2 Python
      fireEvent.change(langSelect, { target: { value: "python" } });
      expect(editor).toHaveValue("# Q2 Python");

      // Return to Q1
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));

      // Verify Q1 Python
      expect(langSelect).toHaveValue("python");
      expect(editor).toHaveValue("# Q1 Python");

      // Verify Q1 Java
      fireEvent.change(langSelect, { target: { value: "java" } });
      expect(editor).toHaveValue("// Q1 Java");
    });

    test("Run uses the currently selected language", async () => {
      render(<App />);

      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });
      fireEvent.change(langSelect, { target: { value: "python" } });

      // Click Run Code
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));

      // Running banner mentions Python
      expect(
        screen.getByText(/Running Question 1 using Python/)
      ).toBeInTheDocument();

      // Complete execution
      await advanceSecondsAsync(1);

      // Result panel displays the executed language badge
      const resultRegion = screen.getByRole("region", {
        name: "Execution result",
      });
      expect(resultRegion).toBeInTheDocument();
      expect(resultRegion).toHaveTextContent("Python");
    });

    test("Submit uses the currently selected language", () => {
      render(<App />);

      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });
      fireEvent.change(langSelect, { target: { value: "python" } });

      // Click Finish Assessment and confirm
      fireEvent.click(screen.getByRole("button", { name: "Finish Assessment" }));
      fireEvent.click(screen.getByRole("button", { name: "Yes, submit" }));

      // Submission banner mentions Python
      expect(
        screen.getByText(
          "Your Python solution has been recorded. You may close this window."
        )
      ).toBeInTheDocument();
    });

    test("switching languages does not reset the timer", () => {
      render(<App />);

      const timerDisplay = screen.getByLabelText("Assessment countdown timer");
      expect(timerDisplay).toHaveTextContent("30:00");

      // Advance by 65 seconds (should show 28:55)
      advanceSeconds(65);
      expect(timerDisplay).toHaveTextContent("28:55");

      // Switch language to Python
      const langSelect = screen.getByRole("combobox", {
        name: "Select programming language",
      });
      fireEvent.change(langSelect, { target: { value: "python" } });

      // Timer continues from 28:55 and is not reset to 30:00
      expect(timerDisplay).toHaveTextContent("28:55");

      // Advance another 5 seconds -> 28:50
      advanceSeconds(5);
      expect(timerDisplay).toHaveTextContent("28:50");
    });
  });
});
