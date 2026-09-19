import { render, screen, fireEvent } from "@testing-library/react";
import ExecutionResult from "./ExecutionResult";
import { rawTextNormalizer } from "../test/utils";

describe("ExecutionResult", () => {
  describe("idle state", () => {
    test("renders nothing when result is null or status is idle", () => {
      const { container } = render(
        <ExecutionResult result={null} isRunning={false} />
      );

      expect(container).toBeEmptyDOMElement();
      expect(
        screen.queryByRole("region", { name: "Execution result" })
      ).not.toBeInTheDocument();
    });
  });

  describe("running state", () => {
    test("displays loading spinner and contextual execution message", () => {
      render(
        <ExecutionResult
          result={null}
          isRunning={true}
          languageName="Python"
          questionNumber={2}
        />
      );

      const region = screen.getByRole("region", { name: "Execution result" });
      expect(region).toBeInTheDocument();
      expect(screen.getByText("Executing code…")).toBeInTheDocument();
      expect(
        screen.getByText("Running Question 2 using Python…")
      ).toBeInTheDocument();
    });
  });

  describe("success state", () => {
    test("displays success status, language badge, execution time, and preformatted output", () => {
      const successResult = {
        status: "success",
        language: "Java",
        input: "nums = [2, 7, 11, 15]\ntarget = 9",
        output: "Mock execution completed\n[0, 1]",
        executionTime: "15 ms",
      };

      render(<ExecutionResult result={successResult} isRunning={false} />);

      const region = screen.getByRole("region", { name: "Execution result" });
      expect(region).toHaveClass("bg-green-50");
      expect(screen.getByText("✓ Success")).toBeInTheDocument();
      expect(screen.getByText("Java")).toBeInTheDocument();
      expect(screen.getByText(/Execution time: 15 ms/)).toBeInTheDocument();

      // Custom input block
      expect(screen.getByText("Custom Input")).toBeInTheDocument();
      expect(
        screen.getByText("nums = [2, 7, 11, 15]\ntarget = 9", {
          normalizer: rawTextNormalizer,
        })
      ).toBeInTheDocument();

      // Output block
      expect(screen.getByText("Output")).toBeInTheDocument();
      expect(
        screen.getByText("Mock execution completed\n[0, 1]", {
          normalizer: rawTextNormalizer,
        })
      ).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    test("displays error status, red styling, and error message in pre element", () => {
      const errorResult = {
        status: "error",
        language: "Python",
        error: "IndentationError: unexpected indent at line 4",
      };

      render(<ExecutionResult result={errorResult} isRunning={false} />);

      const region = screen.getByRole("region", { name: "Execution result" });
      expect(region).toHaveClass("bg-red-50");
      expect(screen.getByText("✗ Error")).toBeInTheDocument();
      expect(screen.getByText("Python")).toBeInTheDocument();
      expect(
        screen.getByText("IndentationError: unexpected indent at line 4")
      ).toBeInTheDocument();
    });

    test("displays compilation error with Compile-time badge and compiler details", () => {
      const compileErrorResult = {
        status: "error",
        errorType: "compilation",
        language: "Java",
        error: "Line 5: error: ';' expected",
      };

      render(<ExecutionResult result={compileErrorResult} isRunning={false} />);

      expect(screen.getByText("✗ Compilation Error")).toBeInTheDocument();
      expect(screen.getByText("Compile-time")).toBeInTheDocument();
      expect(screen.getByText("Compiler error details")).toBeInTheDocument();
      expect(screen.getByText("Line 5: error: ';' expected")).toBeInTheDocument();
    });

    test("displays runtime error with Runtime badge and exception details", () => {
      const runtimeErrorResult = {
        status: "error",
        errorType: "runtime",
        language: "Java",
        error: "java.lang.ArithmeticException: / by zero",
      };

      render(<ExecutionResult result={runtimeErrorResult} isRunning={false} />);

      expect(screen.getByText("✗ Runtime Error")).toBeInTheDocument();
      expect(screen.getByText("Runtime")).toBeInTheDocument();
      expect(
        screen.getByText("Runtime exception details")
      ).toBeInTheDocument();
      expect(
        screen.getByText("java.lang.ArithmeticException: / by zero")
      ).toBeInTheDocument();
    });
  });

  describe("automatic evaluation granular results", () => {
    test("displays Wrong Answer banner with passed/total count and masked hidden test case", () => {
      const granularResult = {
        status: "wrong_answer",
        verdict: "WRONG_ANSWER",
        passedCount: 8,
        totalCount: 10,
        language: "Java",
        executionTime: 120,
        cases: [
          {
            id: "c-1",
            name: "Test Case 1",
            passed: true,
            hidden: false,
            inputs: { nums: [2, 7, 11, 15], target: 9 },
            output: "[0, 1]",
            expected: [0, 1],
          },
          {
            id: "c-2",
            name: "Test Case 2",
            passed: false,
            hidden: true,
          },
        ],
      };

      render(
        <ExecutionResult result={granularResult} isRunning={false} />
      );

      // Status header
      expect(screen.getByText("✗ Wrong Answer")).toBeInTheDocument();
      expect(
        screen.getByText("(8 / 10 test cases passed)")
      ).toBeInTheDocument();
      expect(screen.getByText(/Execution time: 120 ms/)).toBeInTheDocument();

      // Case 1 (visible) shows inputs & outputs
      expect(screen.getByText("Test Case 1")).toBeInTheDocument();
      expect(screen.getByText("Test Case 2")).toBeInTheDocument();
      expect(screen.getByText("Your Output")).toBeInTheDocument();
      expect(screen.getAllByText("[0, 1]")).toHaveLength(2);

      // Switch to Case 2 (hidden)
      fireEvent.click(screen.getByRole("tab", { name: /Test Case 2/ }));

      // Hidden test case protects inputs and expected outputs
      expect(screen.getByText("Hidden Test Case")).toBeInTheDocument();
      expect(
        screen.getByText(
          "This test case is hidden to maintain assessment integrity. Inputs and expected output values are kept exclusively on the server."
        )
      ).toBeInTheDocument();
      expect(screen.queryByText("Your Output")).not.toBeInTheDocument();
      expect(screen.queryByText("Expected Output")).not.toBeInTheDocument();
    });
  });
});

