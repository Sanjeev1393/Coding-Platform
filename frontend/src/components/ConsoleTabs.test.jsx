import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConsoleTabs from "./ConsoleTabs";

describe("ConsoleTabs", () => {
  describe("default and collapsed states", () => {
    test("is collapsed by default and renders only Custom Input tab when idle", () => {
      render(
        <ConsoleTabs
          customInput=""
          onCustomInputChange={vi.fn()}
          executionResult={{ status: "idle" }}
        />
      );

      const inputTab = screen.getByRole("button", { name: /custom input/i });
      expect(inputTab).toBeInTheDocument();
      expect(inputTab).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByRole("textbox", { name: "Custom Input" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /test result/i })
      ).not.toBeInTheDocument();
    });

    test("clicking Custom Input tab expands and reveals textarea", async () => {
      const user = userEvent.setup();
      render(
        <ConsoleTabs
          customInput=""
          onCustomInputChange={vi.fn()}
          executionResult={{ status: "idle" }}
        />
      );

      const inputTab = screen.getByRole("button", { name: /custom input/i });
      await user.click(inputTab);

      expect(inputTab).toHaveAttribute("aria-expanded", "true");
      expect(
        screen.getByRole("textbox", { name: "Custom Input" })
      ).toBeInTheDocument();

      // Clicking again collapses it
      await user.click(inputTab);
      expect(inputTab).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByRole("textbox", { name: "Custom Input" })
      ).not.toBeInTheDocument();
    });

    test("displays Active badge when custom input is non-empty", () => {
      render(
        <ConsoleTabs
          customInput="test data"
          onCustomInputChange={vi.fn()}
          executionResult={{ status: "idle" }}
        />
      );

      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  describe("execution and tab auto-switching", () => {
    test("auto-opens and activates Test Result tab when isRunning is true", () => {
      render(
        <ConsoleTabs
          customInput=""
          onCustomInputChange={vi.fn()}
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
        status: "success",
        language: "Java",
        output: "Test passed!",
        executionTime: "12ms",
      };

      render(
        <ConsoleTabs
          customInput=""
          onCustomInputChange={vi.fn()}
          isRunning={false}
          executionResult={successResult}
          languageName="Java"
          questionNumber={1}
        />
      );

      const resultTab = screen.getByRole("button", { name: /test result/i });
      expect(resultTab).toBeInTheDocument();
      expect(resultTab).toHaveAttribute("aria-selected", "true");
      expect(screen.getByText("✓ Success")).toBeInTheDocument();
      expect(screen.getByText("Test passed!")).toBeInTheDocument();
    });

    test("allows candidate to switch between Custom Input and Test Result tabs seamlessly", async () => {
      const user = userEvent.setup();
      const successResult = {
        status: "success",
        language: "Python",
        output: "Result output",
        executionTime: "8ms",
      };

      render(
        <ConsoleTabs
          customInput="candidate input"
          onCustomInputChange={vi.fn()}
          isRunning={false}
          executionResult={successResult}
          languageName="Python"
          questionNumber={1}
        />
      );

      // Initially active on Test Result
      expect(screen.getByText("Result output")).toBeInTheDocument();

      // Click Custom Input tab: switches to input view
      const inputTab = screen.getByRole("button", { name: /custom input/i });
      await user.click(inputTab);

      const textarea = screen.getByRole("textbox", { name: "Custom Input" });
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue("candidate input");

      // Click Test Result tab: switches back to result view
      const resultTab = screen.getByRole("button", { name: /test result/i });
      await user.click(resultTab);

      expect(screen.getByText("Result output")).toBeInTheDocument();
    });
  });

  describe("input interactions and controls", () => {
    test("typing in the textarea triggers onCustomInputChange", async () => {
      const user = userEvent.setup();
      const onCustomInputChange = vi.fn();

      render(
        <ConsoleTabs
          customInput=""
          onCustomInputChange={onCustomInputChange}
          defaultOpen={true}
        />
      );

      const textarea = screen.getByRole("textbox", { name: "Custom Input" });
      await user.type(textarea, "abc");

      expect(onCustomInputChange).toHaveBeenCalledTimes(3);
    });

    test("clicking Clear button resets custom input", async () => {
      const user = userEvent.setup();
      const onCustomInputChange = vi.fn();

      render(
        <ConsoleTabs
          customInput="sample input"
          onCustomInputChange={onCustomInputChange}
          defaultOpen={true}
        />
      );

      const clearBtn = screen.getByRole("button", { name: "Clear" });
      await user.click(clearBtn);

      expect(onCustomInputChange).toHaveBeenCalledWith({
        target: { value: "" },
      });
    });

    test("all tab buttons and textarea are disabled when disabled prop is true", () => {
      render(
        <ConsoleTabs
          customInput="sample input"
          onCustomInputChange={vi.fn()}
          disabled={true}
          defaultOpen={true}
        />
      );

      expect(
        screen.getByRole("button", { name: /custom input/i })
      ).toBeDisabled();
      expect(screen.getByRole("textbox", { name: "Custom Input" })).toBeDisabled();
    });
  });
});
