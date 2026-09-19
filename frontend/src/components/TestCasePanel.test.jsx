import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TestCasePanel from "./TestCasePanel";

describe("TestCasePanel", () => {
  const mockCases = [
    {
      id: "case-1",
      inputs: { nums: [2, 7, 11, 15], target: 9 },
      expectedOutput: [0, 1],
      explanation: "Sum of 2 and 7 is 9",
    },
    {
      id: "case-2",
      inputs: { nums: [3, 2, 4], target: 6 },
      expectedOutput: [1, 2],
    },
  ];

  it("renders test case tabs", () => {
    render(
      <TestCasePanel
        testCases={mockCases}
        selectedCaseIndex={0}
        onSelectCase={vi.fn()}
      />
    );

    expect(screen.getByRole("tab", { name: "Case 1" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Case 2" })).toBeInTheDocument();
  });

  it("displays input parameters and expected output for selected case", () => {
    render(
      <TestCasePanel
        testCases={mockCases}
        selectedCaseIndex={0}
        onSelectCase={vi.fn()}
      />
    );

    expect(screen.getByText("nums =")).toBeInTheDocument();
    expect(screen.getByText("[2, 7, 11, 15]")).toBeInTheDocument();
    expect(screen.getByText("target =")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("Expected Output:")).toBeInTheDocument();
    expect(screen.getByText("[0, 1]")).toBeInTheDocument();
    expect(
      screen.getByText(/Sum of 2 and 7 is 9/)
    ).toBeInTheDocument();
  });

  it("calls onSelectCase when tab is clicked", () => {
    const handleSelectCase = vi.fn();
    render(
      <TestCasePanel
        testCases={mockCases}
        selectedCaseIndex={0}
        onSelectCase={handleSelectCase}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Case 2" }));
    expect(handleSelectCase).toHaveBeenCalledWith(1);
  });

  it("handles empty testCases gracefully", () => {
    render(
      <TestCasePanel
        testCases={[]}
        selectedCaseIndex={0}
        onSelectCase={vi.fn()}
      />
    );

    expect(
      screen.getByText("No test cases available for this question.")
    ).toBeInTheDocument();
  });
});
