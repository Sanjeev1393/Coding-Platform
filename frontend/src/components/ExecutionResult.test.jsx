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
  });
});
