import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConsoleTabs from "./ConsoleTabs";

describe("ConsoleTabs", () => {
  const mockTestCases = [
    {
      id: "c1",
      inputs: { nums: [2, 7, 11, 15], target: 9 },
      expectedOutput: [0, 1],
    },
    {
      id: "c2",
      inputs: { nums: [3, 2, 4], target: 6 },
      expectedOutput: [1, 2],
    },
  ];

  describe("default and collapsed states", () => {
    test("is collapsed by default and renders only Testcase tab when idle", () => {
      render(
        <ConsoleTabs
          testCases={mockTestCases}
          selectedCaseIndex={0}
          onSelectCase={vi.fn()}
          executionResult={{ status: "idle" }}
        />
      );

      const testcaseTab = screen.getByRole("button", { name: /testcase/i });
      expect(testcaseTab).toBeInTheDocument();
      expect(testcaseTab).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("tab", { name: "Case 1" })).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /test result/i })
      ).not.toBeInTheDocument();
    });

    test("clicking Testcase tab expands and reveals test cases", async () => {
      const user = userEvent.setup();
      render(
        <ConsoleTabs
          testCases={mockTestCases}
          selectedCaseIndex={0}
          onSelectCase={vi.fn()}
          executionResult={{ status: "idle" }}
        />
      );

      const testcaseTab = screen.getByRole("button", { name: /testcase/i });
      await user.click(testcaseTab);

      expect(testcaseTab).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("tab", { name: "Case 1" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Case 2" })).toBeInTheDocument();
      expect(screen.getByText("nums =")).toBeInTheDocument();

      // Clicking again collapses it
      await user.click(testcaseTab);
      expect(testcaseTab).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("tab", { name: "Case 1" })).not.toBeInTheDocument();
    });
  });

  describe("execution and tab auto-switching", () => {
    test("auto-opens and activates Test Result tab when isRunning is true", () => {
      render(
        <ConsoleTabs
          testCases={mockTestCases}
          selectedCaseIndex={0}
          onSelectCase={vi.fn()}
          isRunning={true}
          executionResult={{ status: "idle" }}
          languageName="Java"
          questionNumber={1}
        />
      );

      const resultTab = screen.getByRole("button", { name: /test result/i });
      expect(resultTab).toBeInTheDocument();
      expect(resultTab).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByRole("region", { name: "Execution result" })
      ).toBeInTheDocument();
      expect(screen.getByText("Executing code…")).toBeInTheDocument();
    });

    test("auto-opens and shows success output when execution result arrives", () => {
      const successResult = {
        status: "accepted",
        language: "Java",
        output: "[0, 1]",
        executionTime: "12 ms",
      };

      render(
        <ConsoleTabs
          testCases={mockTestCases}
          selectedCaseIndex={0}
          onSelectCase={vi.fn()}
          isRunning={false}
          executionResult={successResult}
          languageName="Java"
          questionNumber={1}
        />
      );

      const resultTab = screen.getByRole("button", { name: /test result/i });
      expect(resultTab).toBeInTheDocument();
      const resultRegion = screen.getByRole("region", {
        name: "Execution result",
      });
      expect(resultTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByText("✓ Accepted")).toBeInTheDocument();
      expect(within(resultRegion).getByText("[0, 1]")).toBeInTheDocument();
    });

    test("allows candidate to switch between Testcase and Test Result tabs seamlessly", async () => {
      const user = userEvent.setup();
      const successResult = {
        status: "accepted",
        language: "Python",
        output: "Result output",
        executionTime: "8 ms",
      };

      render(
        <ConsoleTabs
          testCases={mockTestCases}
          selectedCaseIndex={0}
          onSelectCase={vi.fn()}
          isRunning={false}
          executionResult={successResult}
          languageName="Python"
          questionNumber={1}
        />
      );

      // Initially active on Test Result
      expect(screen.getByText("Result output")).toBeInTheDocument();

      // Click Testcase tab: switches to testcase view
      const testcaseTab = screen.getByRole("button", { name: /testcase/i });
      await user.click(testcaseTab);

      expect(screen.getByRole("tab", { name: "Case 1" })).toBeInTheDocument();
      expect(screen.getByText("nums =")).toBeInTheDocument();

      // Click Test Result tab: switches back to result view
      const resultTab = screen.getByRole("button", { name: /test result/i });
      await user.click(resultTab);

      expect(screen.getByText("Result output")).toBeInTheDocument();
    });
  });

  describe("case tab interactions and controls", () => {
    test("clicking case tab calls onSelectCase with index", async () => {
      const user = userEvent.setup();
      const onSelectCase = vi.fn();

      render(
        <ConsoleTabs
          testCases={mockTestCases}
          selectedCaseIndex={0}
          onSelectCase={onSelectCase}
          defaultOpen={true}
        />
      );

      const case2Tab = screen.getByRole("tab", { name: "Case 2" });
      await user.click(case2Tab);

      expect(onSelectCase).toHaveBeenCalledWith(1);
    });

    test("all tab buttons are disabled when disabled prop is true", () => {
      render(
        <ConsoleTabs
          testCases={mockTestCases}
          selectedCaseIndex={0}
          onSelectCase={vi.fn()}
          disabled={true}
          defaultOpen={true}
        />
      );

      expect(
        screen.getByRole("button", { name: /testcase/i })
      ).toBeDisabled();
      expect(screen.getByRole("tab", { name: "Case 1" })).toBeDisabled();
    });
  });
});
