import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";
import { questions as defaultQuestions } from "./constants";

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
      expect(editor).toHaveValue(defaultQuestions[0].starterCode);

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
      expect(editor).toHaveValue(defaultQuestions[1].starterCode);

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
        defaultQuestions[0].starterCode
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
      expect(editor).toHaveValue(defaultQuestions[1].starterCode);

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
        screen.getByText(/2 \/ 2 test cases passed/)
      ).toBeInTheDocument();

      // Navigate to Question 2
      fireEvent.click(screen.getByRole("button", { name: "Next" }));

      // Execution result must be cleared
      expect(
        screen.queryByText(/2 \/ 2 test cases passed/)
      ).not.toBeInTheDocument();

      // Navigate back to Question 1: result should remain cleared on navigation
      fireEvent.click(screen.getByRole("button", { name: "Previous" }));
      expect(
        screen.queryByText(/2 \/ 2 test cases passed/)
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
    test("run empty code: validation message appears", () => {
      render(<App />);

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      fireEvent.change(editor, { target: { value: "   " } });

      fireEvent.click(screen.getByRole("button", { name: "Run code" }));

      expect(
        screen.getByText(
          "Editor is empty. Please write your solution before running."
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/2 \/ 2 test cases passed/)
      ).not.toBeInTheDocument();
    });

    test("run valid code: loading state appears, followed by mock result", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: "Run code" }));

      // Loading state
      expect(screen.getByRole("button", { name: "Running…" })).toBeDisabled();
      expect(screen.getByText("Executing code…")).toBeInTheDocument();

      // Fast-forward mock 1s execution
      advanceSeconds(1);

      // Result appears and button restores
      expect(
        screen.getByText(/2 \/ 2 test cases passed/)
      ).toBeInTheDocument();
      expect(screen.getByText("Output")).toBeInTheDocument();
      expect(screen.getAllByText("[0, 1]")).toHaveLength(2);
      expect(screen.getByRole("button", { name: "Run code" })).toBeEnabled();
    });

    test("click Run repeatedly: only one execution is started", () => {
      render(<App />);

      const runBtn = screen.getByRole("button", { name: "Run code" });
      fireEvent.click(runBtn);

      // During run, button is disabled with "Running…"
      const runningBtn = screen.getByRole("button", { name: "Running…" });
      expect(runningBtn).toBeDisabled();

      // Subsequent clicks while running are blocked
      fireEvent.click(runningBtn);

      // Finish execution
      advanceSeconds(1);

      expect(
        screen.getByText(/2 \/ 2 test cases passed/)
      ).toBeInTheDocument();
    });
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
          "Your code has been recorded. You may close this window."
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

    test("expired timer: run and submit follow the expiry rule", () => {
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
    });
  });
});
