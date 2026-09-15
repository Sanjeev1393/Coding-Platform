import { render, screen } from "@testing-library/react";
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
});
