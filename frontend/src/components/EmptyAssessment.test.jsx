import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EmptyAssessment from "./EmptyAssessment";

describe("EmptyAssessment", () => {
  it("renders default title and message for empty assessment", () => {
    render(<EmptyAssessment />);

    expect(screen.getByText("No questions available")).toBeInTheDocument();
    expect(
      screen.getByText("No questions are available for this assessment.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /try again/i })
    ).not.toBeInTheDocument();
  });

  it("renders error state and invokes onRetry callback when Try again is clicked", () => {
    const handleRetry = vi.fn();
    const error = new Error("Backend connection failed.");

    render(<EmptyAssessment error={error} onRetry={handleRetry} />);

    expect(
      screen.getByText("Unable to load assessment questions")
    ).toBeInTheDocument();
    expect(screen.getByText("Backend connection failed.")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
