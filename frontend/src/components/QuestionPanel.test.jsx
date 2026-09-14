import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rawTextNormalizer } from "../test/utils";
import QuestionPanel from "./QuestionPanel";

// ─── Shared test data ─────────────────────────────────────────────────────────

const QUESTION_1 = {
  id: "two-sum",
  title: "Two Sum",
  description:
    "Given an array of integers and a target, return the indices of two numbers whose sum equals the target.",
  sampleInput: "numbers = [2, 7, 11, 15], target = 9",
  sampleOutput: "[0, 1]",
};

const QUESTION_2 = {
  id: "reverse-string",
  title: "Reverse String",
  description: "Given a string, return a new string with the characters reversed.",
  sampleInput: 's = "hello"',
  sampleOutput: '"olleh"',
};

// Helper: render QuestionPanel with sensible defaults that can be overridden
function renderPanel(overrides = {}) {
  const defaults = {
    question: QUESTION_1,
    questionNumber: 1,
    totalQuestions: 2,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    isFirstQuestion: false,
    isLastQuestion: false,
  };

  return render(<QuestionPanel {...defaults} {...overrides} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("QuestionPanel", () => {
  describe("content rendering", () => {
    test("displays the question title as a heading", () => {
      renderPanel();
      expect(
        screen.getByRole("heading", { name: "Two Sum" })
      ).toBeInTheDocument();
    });

    test("displays the question description", () => {
      renderPanel();
      expect(
        screen.getByText(/return the indices of two numbers/i)
      ).toBeInTheDocument();
    });

    test("displays the question progress counter", () => {
      renderPanel({ questionNumber: 1, totalQuestions: 2 });
      expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    });

    test("displays the sample input", () => {
      renderPanel();
      expect(
        screen.getByText(/numbers = \[2, 7, 11, 15\], target = 9/i)
      ).toBeInTheDocument();
    });

    test("displays the sample output", () => {
      renderPanel();
      expect(screen.getByText("[0, 1]")).toBeInTheDocument();
    });

    test("renders nothing when question is null", () => {
      const { container } = render(
        <QuestionPanel
          question={null}
          questionNumber={1}
          totalQuestions={2}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
          isFirstQuestion={false}
          isLastQuestion={false}
        />
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("navigation button states", () => {
    test("Previous button is disabled on the first question", () => {
      renderPanel({ isFirstQuestion: true });
      expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    });

    test("Next button is disabled on the last question", () => {
      renderPanel({ isLastQuestion: true });
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });

    test("Previous button is enabled in the middle of the question list", () => {
      renderPanel({ isFirstQuestion: false, isLastQuestion: false });
      expect(
        screen.getByRole("button", { name: "Previous" })
      ).not.toBeDisabled();
    });

    test("Next button is enabled in the middle of the question list", () => {
      renderPanel({ isFirstQuestion: false, isLastQuestion: false });
      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
    });

    test("both buttons are disabled when there is only one question", () => {
      renderPanel({ isFirstQuestion: true, isLastQuestion: true });
      expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });
  });

  describe("navigation interactions", () => {
    test("clicking Next calls onNext", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();

      renderPanel({ onNext, isLastQuestion: false });
      await user.click(screen.getByRole("button", { name: "Next" }));

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    test("clicking Previous calls onPrevious", async () => {
      const user = userEvent.setup();
      const onPrevious = vi.fn();

      renderPanel({ onPrevious, isFirstQuestion: false });
      await user.click(screen.getByRole("button", { name: "Previous" }));

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    test("clicking Next does not call onNext when disabled", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();

      renderPanel({ onNext, isLastQuestion: true });
      await user.click(screen.getByRole("button", { name: "Next" }));

      expect(onNext).not.toHaveBeenCalled();
    });

    test("switching question prop renders the new question title", () => {
      const { rerender } = renderPanel({ question: QUESTION_1 });

      expect(screen.getByRole("heading", { name: "Two Sum" })).toBeInTheDocument();

      rerender(
        <QuestionPanel
          question={QUESTION_2}
          questionNumber={2}
          totalQuestions={2}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
          isFirstQuestion={false}
          isLastQuestion={true}
        />
      );

      expect(
        screen.getByRole("heading", { name: "Reverse String" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Two Sum" })
      ).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    test("long question text renders without truncation", () => {
      const longQuestion = {
        ...QUESTION_1,
        title: "A".repeat(120),
        description: "B".repeat(500),
      };

      renderPanel({ question: longQuestion });

      // The full title and description must appear in the DOM — no ellipsis
      // or clipping at the component level (CSS may scroll, but the full
      // text content must be present).
      expect(
        screen.getByRole("heading", { name: "A".repeat(120) })
      ).toBeInTheDocument();
      expect(screen.getByText("B".repeat(500))).toBeInTheDocument();
    });

    test("multiline sample input preserves line breaks and whitespace", () => {
      const multilineQuestion = {
        ...QUESTION_1,
        sampleInput: "line one\nline two\n  indented",
      };

      renderPanel({ question: multilineQuestion });

      // RTL normalises whitespace by default (collapses \n to spaces).
      // We disable that so we can assert the raw content of <pre> unchanged.
      expect(
        screen.getByText("line one\nline two\n  indented", {
          normalizer: rawTextNormalizer,
        })
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    test("navigation buttons can be found by their accessible names", () => {
      renderPanel();
      expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });

    test("disabled navigation buttons use the native disabled attribute", () => {
      renderPanel({ isFirstQuestion: true, isLastQuestion: true });
      const prevBtn = screen.getByRole("button", { name: "Previous" });
      const nextBtn = screen.getByRole("button", { name: "Next" });

      expect(prevBtn).toHaveAttribute("disabled");
      expect(nextBtn).toHaveAttribute("disabled");
      expect(prevBtn).toBeDisabled();
      expect(nextBtn).toBeDisabled();
    });

    test("headings follow a logical hierarchy (h2 for title, h3 for sample sections)", () => {
      renderPanel();

      expect(
        screen.getByRole("heading", { level: 2, name: QUESTION_1.title })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "Sample input" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "Sample output" })
      ).toBeInTheDocument();
    });

    test("navigation works with keyboard interaction (Enter and Space keys)", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      renderPanel({
        onNext,
        onPrevious,
        isFirstQuestion: false,
        isLastQuestion: false,
      });

      const prevBtn = screen.getByRole("button", { name: "Previous" });
      const nextBtn = screen.getByRole("button", { name: "Next" });

      prevBtn.focus();
      await user.keyboard("{Enter}");
      expect(onPrevious).toHaveBeenCalledTimes(1);

      nextBtn.focus();
      await user.keyboard(" ");
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    test("navigation buttons receive focus and display visible focus ring styles", async () => {
      const user = userEvent.setup();
      renderPanel({ isFirstQuestion: false, isLastQuestion: false });

      const prevBtn = screen.getByRole("button", { name: "Previous" });
      const nextBtn = screen.getByRole("button", { name: "Next" });

      await user.tab();
      expect(prevBtn).toHaveFocus();
      expect(prevBtn.className).toMatch(/focus-visible:ring-2/);

      await user.tab();
      expect(nextBtn).toHaveFocus();
      expect(nextBtn.className).toMatch(/focus-visible:ring-2/);
    });
  });
});
