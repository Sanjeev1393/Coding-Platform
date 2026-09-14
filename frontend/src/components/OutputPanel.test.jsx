import { render, screen } from "@testing-library/react";
import { rawTextNormalizer } from "../test/utils";
import OutputPanel from "./OutputPanel";

// ─── Shared test data ─────────────────────────────────────────────────────────

const PASSING_RESULT = {
  status: "Accepted",
  testCases: 5,
  output: "2\n7\n11",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderOutput(overrides = {}) {
  const defaults = {
    result: null,
    error: null,
    isRunning: false,
  };

  return render(<OutputPanel {...defaults} {...overrides} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("OutputPanel", () => {
  // ─── core states ─────────────────────────────────────────────────────

  describe("core states", () => {
    test("renders nothing when there is no result, no error, and not running", () => {
      const { container } = renderOutput();

      // The component returns null — the container must be completely empty.
      expect(container).toBeEmptyDOMElement();
    });

    test("shows a loading status while code is running", () => {
      renderOutput({ isRunning: true });

      expect(screen.getByText("Executing code…")).toBeInTheDocument();
      expect(
        screen.getByText("Running test cases against your solution.")
      ).toBeInTheDocument();
    });

    test("shows test pass count and output on a successful execution", () => {
      renderOutput({ result: PASSING_RESULT });

      expect(
        screen.getByText(/Accepted — 5 test cases passed/)
      ).toBeInTheDocument();
      expect(screen.getByText("Output")).toBeInTheDocument();
      expect(
        screen.getByText("2\n7\n11", { normalizer: rawTextNormalizer })
      ).toBeInTheDocument();
    });

    test("shows failure status and error details when a test case fails", () => {
      // A failed test is surfaced to OutputPanel as an error string from the
      // parent — the parent formats the failure details into the message.
      const failureMessage =
        "Test case 2 failed.\nExpected: [0, 1]\nActual:   [1, 0]";

      renderOutput({ error: failureMessage });

      expect(screen.getByText("Validation error")).toBeInTheDocument();
      // The error message contains newlines — disable RTL's default whitespace
      // normaliser so the assertion matches the raw text content.
      expect(
        screen.getByText(failureMessage, { normalizer: rawTextNormalizer })
      ).toBeInTheDocument();
    });

    test("shows an error message when execution throws", () => {
      renderOutput({ error: "SyntaxError: unexpected token at line 3" });

      expect(screen.getByText("Validation error")).toBeInTheDocument();
      expect(
        screen.getByText("SyntaxError: unexpected token at line 3")
      ).toBeInTheDocument();
    });
  });

  // ─── edge cases ──────────────────────────────────────────────────────

  describe("edge cases", () => {
    test("multiline output preserves line breaks inside the pre element", () => {
      const multilineResult = {
        status: "Accepted",
        testCases: 3,
        output: "line 1\nline 2\nline 3",
      };

      renderOutput({ result: multilineResult });

      // The output is rendered inside <pre> so whitespace must be preserved.
      // Pass a no-op normalizer to prevent RTL collapsing \n to spaces.
      expect(
        screen.getByText("line 1\nline 2\nline 3", { normalizer: rawTextNormalizer })
      ).toBeInTheDocument();
    });

    test("previous result is cleared when a new execution starts (isRunning replaces result)", () => {
      // Simulate: result was shown, then user clicks Run again.
      // The parent passes isRunning=true and clears result to null.
      // OutputPanel should show the loading banner, not stale output.
      const { rerender } = renderOutput({ result: PASSING_RESULT });

      expect(screen.getByText(/Accepted/)).toBeInTheDocument();

      rerender(<OutputPanel result={null} error={null} isRunning={true} />);

      expect(screen.queryByText(/Accepted/)).not.toBeInTheDocument();
      expect(screen.getByText("Executing code…")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    test("error feedback uses role='alert' for immediate announcement", () => {
      renderOutput({ error: "Compilation error: missing semicolon" });

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Validation error");
      expect(alert).toHaveTextContent("Compilation error: missing semicolon");
    });

    test("loading feedback uses role='status' for polite announcement", () => {
      renderOutput({ isRunning: true });

      const status = screen.getByRole("status");
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent("Executing code…");
      expect(status).toHaveTextContent("Running test cases against your solution.");
    });

    test("execution result is contained within an accessible landmark region", () => {
      renderOutput({ result: PASSING_RESULT });

      expect(
        screen.getByRole("region", { name: "Execution result" })
      ).toBeInTheDocument();
    });

    test("colour is not the only indication of success", () => {
      renderOutput({ result: PASSING_RESULT });

      // In addition to green border/background styling, communicates success
      // via symbol '✓' and explicit textual status 'Accepted' with test count
      expect(
        screen.getByText(/✓ Accepted — 5 test cases passed/)
      ).toBeInTheDocument();
    });

    test("colour is not the only indication of failure", () => {
      renderOutput({ error: "Execution timed out" });

      // In addition to red styling, communicates error via explicit heading
      // 'Validation error' and descriptive text
      expect(screen.getByText("Validation error")).toBeInTheDocument();
      expect(screen.getByText("Execution timed out")).toBeInTheDocument();
    });
  });
});
