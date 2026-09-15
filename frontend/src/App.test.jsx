import { render, screen, fireEvent, act, within } from "@testing-library/react";
import App from "./App";
import { questions as defaultQuestions } from "./constants";
import { getStarterCode } from "./utils/languageUtils";

// ─── Module Mocking ────────────────────────────────────────────────────────────

let mockQuestions = null;

vi.mock("./constants", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    get questions() {
      return mockQuestions !== null ? mockQuestions : actual.questions;
    },
  };
});

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

    test("clear execution result on navigation: Question 1 result does not appear on Question 2", () => {
      render(<App />);

      // Run code on Question 1
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      advanceSeconds(1);

      // Execution result appears for Question 1
      expect(
        screen.getByText("Mock execution completed")
      ).toBeInTheDocument();

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      // Execution result must be cleared (hidden)
      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Mock execution completed")
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
    test("custom input accepts text", () => {
      render(<App />);

      // Expand Custom Input tab
      fireEvent.click(screen.getByRole("button", { name: /custom input/i }));

      const customInput = screen.getByRole("textbox", { name: "Custom Input" });
      expect(customInput).toHaveValue("");

      fireEvent.change(customInput, { target: { value: "10 20\n30" } });
      expect(customInput).toHaveValue("10 20\n30");
    });

    test("each question preserves its own custom input across navigation", () => {
      render(<App />);

      // Expand Custom Input on Question 1
      fireEvent.click(screen.getByRole("button", { name: /custom input/i }));
      const customInputQ1 = screen.getByRole("textbox", {
        name: "Custom Input",
      });
      fireEvent.change(customInputQ1, { target: { value: "Q1 custom testcase" } });
      expect(customInputQ1).toHaveValue("Q1 custom testcase");

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      // Question 2 should have empty custom input
      const toggleQ2 = screen.getByRole("button", { name: /custom input/i });
      fireEvent.click(toggleQ2);
      const customInputQ2 = screen.getByRole("textbox", {
        name: "Custom Input",
      });
      expect(customInputQ2).toHaveValue("");

      // Provide custom input for Question 2
      fireEvent.change(customInputQ2, { target: { value: "Q2 custom testcase" } });
      expect(customInputQ2).toHaveValue("Q2 custom testcase");

      // Navigate back to Question 1: Question 1's custom input is preserved
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      const toggleQ1Back = screen.getByRole("button", { name: /custom input/i });
      fireEvent.click(toggleQ1Back);
      expect(
        screen.getByRole("textbox", { name: "Custom Input" })
      ).toHaveValue("Q1 custom testcase");

      // Navigate to Question 2: Question 2's custom input is preserved
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      const toggleQ2Back = screen.getByRole("button", { name: /custom input/i });
      fireEvent.click(toggleQ2Back);
      expect(
        screen.getByRole("textbox", { name: "Custom Input" })
      ).toHaveValue("Q2 custom testcase");
    });

    test("output panel is hidden initially until code is executed", () => {
      render(<App />);

      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
    });

    test("clicking Run changes the button to Running.... and disables it", () => {
      render(<App />);

      const runBtn = screen.getByRole("button", { name: "Run code" });
      fireEvent.click(runBtn);

      const runningBtn = screen.getByRole("button", { name: "Running…" });
      expect(runningBtn).toBeInTheDocument();
      expect(runningBtn).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Code editor" })).toBeDisabled();
      expect(screen.getByText("Executing code…")).toBeInTheDocument();
    });

    test("mock output appears after execution with language, custom input, and timing", () => {
      render(<App />);

      // Expand Custom Input tab
      fireEvent.click(screen.getByRole("button", { name: /custom input/i }));

      // Provide custom input
      const customInput = screen.getByRole("textbox", { name: "Custom Input" });
      fireEvent.change(customInput, { target: { value: "test input" } });

      // Run code
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      advanceSeconds(1);

      // Verify output panel contents
      const resultRegion = screen.getByRole("region", {
        name: "Execution result",
      });
      expect(resultRegion).toBeInTheDocument();
      expect(screen.getByText("✓ Success")).toBeInTheDocument();
      expect(resultRegion).toHaveTextContent("Java");
      expect(screen.getByText(/Execution time: 15 ms/)).toBeInTheDocument();
      expect(within(resultRegion).getByText("test input")).toBeInTheDocument();
      expect(screen.getByText("Mock execution completed")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Run code" })).toBeEnabled();
    });

    test("header displays 'DSA Coding Assessment' as test name", () => {
      render(<App />);
      expect(screen.getByText("DSA Coding Assessment")).toBeInTheDocument();
    });

    test("when output appears, user can easily reopen Custom Input and update it", () => {
      render(<App />);

      // Run code to produce output
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      advanceSeconds(1);

      // Output appears
      expect(screen.getByText("Mock execution completed")).toBeInTheDocument();

      // User can easily reopen Custom Input
      const toggleBtn = screen.getByRole("button", { name: /custom input/i });
      expect(toggleBtn).toBeEnabled();
      fireEvent.click(toggleBtn);

      // Custom input textarea expands and accepts new data
      const textarea = screen.getByRole("textbox", { name: "Custom Input" });
      expect(textarea).toBeInTheDocument();
      fireEvent.change(textarea, { target: { value: "edge case [1, 2]" } });
      expect(textarea).toHaveValue("edge case [1, 2]");

      // Re-running code incorporates the new input into the result
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      advanceSeconds(1);

      const resultRegion = screen.getByRole("region", {
        name: "Execution result",
      });
      expect(within(resultRegion).getByText("edge case [1, 2]")).toBeInTheDocument();
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
        screen.queryByText("Mock execution completed")
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

    test("previous output is cleared when changing questions", () => {
      render(<App />);

      // Run code on Question 1
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      advanceSeconds(1);
      expect(screen.getByText("Mock execution completed")).toBeInTheDocument();

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      // Output should be reset to idle (hidden)
      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Mock execution completed")
      ).not.toBeInTheDocument();
    });

    test("previous output is cleared when changing languages", () => {
      render(<App />);

      // Run code with default language (Java)
      fireEvent.click(screen.getByRole("button", { name: "Run code" }));
      advanceSeconds(1);
      expect(screen.getByText("Mock execution completed")).toBeInTheDocument();

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
        screen.queryByText("Mock execution completed")
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
          screen.getByRole("button", { name: /custom input/i })
        ).toBeDisabled();
      },
      15000
    );

    test("run is unavailable after submission", () => {
      render(<App />);

      // Submit assessment
      fireEvent.click(screen.getByRole("button", { name: "Submit solution" }));
      fireEvent.click(screen.getByRole("button", { name: "Yes, submit" }));

      expect(screen.getByRole("button", { name: "Run code" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Submit solution" })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /custom input/i })
      ).toBeDisabled();
    });

    test("repeated clicks do not start multiple executions", () => {
      render(<App />);

      const runBtn = screen.getByRole("button", { name: "Run code" });
      fireEvent.click(runBtn);

      const runningBtn = screen.getByRole("button", { name: "Running…" });
      expect(runningBtn).toBeDisabled();

      // Second click while running
      fireEvent.click(runningBtn);

      advanceSeconds(1);

      expect(screen.getByText("Mock execution completed")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Run code" })).toBeEnabled();
    });
  });

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────────

  describe("keyboard shortcuts", () => {
    test("Ctrl + Enter executes code (Windows / Linux)", () => {
      render(<App />);

      fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });

      // Changes to running state
      expect(screen.getByRole("button", { name: "Running…" })).toBeDisabled();

      advanceSeconds(1);

      expect(screen.getByText("Mock execution completed")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Run code" })).toBeEnabled();
    });

    test("⌘ + Enter executes code (macOS metaKey)", () => {
      render(<App />);

      fireEvent.keyDown(window, { key: "Enter", metaKey: true });

      expect(screen.getByRole("button", { name: "Running…" })).toBeDisabled();

      advanceSeconds(1);

      expect(screen.getByText("Mock execution completed")).toBeInTheDocument();
    });

    test("Ctrl + Shift + Enter opens submission confirmation dialog", () => {
      render(<App />);

      fireEvent.keyDown(window, {
        key: "Enter",
        ctrlKey: true,
        shiftKey: true,
      });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Submit solution?" })
      ).toBeInTheDocument();
    });

    test("⌘ + Shift + Enter opens submission confirmation dialog (macOS)", () => {
      render(<App />);

      fireEvent.keyDown(window, {
        key: "Enter",
        metaKey: true,
        shiftKey: true,
      });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
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
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      },
      15000
    );
  });

  // ─── Submission flow ─────────────────────────────────────────────────────────

  describe("submission flow", () => {
    test("confirm Submit: submission-success feedback appears", () => {
      render(<App />);

      fireEvent.click(
        screen.getByRole("button", { name: "Submit solution" })
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

    test("cancel Submit: submission does not happen", () => {
      render(<App />);

      fireEvent.click(
        screen.getByRole("button", { name: "Submit solution" })
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

    test("click Submit repeatedly: only one submission is processed", () => {
      render(<App />);

      const submitBtn = screen.getByRole("button", { name: "Submit solution" });
      fireEvent.click(submitBtn);

      // Dialog is open
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Clicking submit again while dialog is open does not spawn multiple dialogs
      fireEvent.click(submitBtn);
      expect(screen.getAllByRole("dialog")).toHaveLength(1);

      // Confirm submit
      fireEvent.click(screen.getByRole("button", { name: "Yes, submit" }));

      expect(
        screen.getByText("✓ Solution submitted successfully.")
      ).toBeInTheDocument();

      // Submit button is now disabled (locked)
      expect(submitBtn).toBeDisabled();
      fireEvent.click(submitBtn);

      // No dialog reopens
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("navigate after submission: behaviour follows chosen business rule", () => {
      render(<App />);

      // Submit on Question 1
      fireEvent.click(
        screen.getByRole("button", { name: "Submit solution" })
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

    test("Run uses the currently selected language", () => {
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
      act(() => {
        vi.advanceTimersByTime(1000);
      });

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

      // Click Submit and confirm
      fireEvent.click(screen.getByRole("button", { name: "Submit solution" }));
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
