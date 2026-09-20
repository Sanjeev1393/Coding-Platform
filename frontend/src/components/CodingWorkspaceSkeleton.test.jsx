import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CodingWorkspaceSkeleton from "./CodingWorkspaceSkeleton";

describe("CodingWorkspaceSkeleton", () => {
  it("renders with accessible status role and aria-busy attributes", () => {
    render(<CodingWorkspaceSkeleton />);

    const skeleton = screen.getByRole("status", {
      name: "Loading coding assessment",
    });
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");

    expect(
      screen.getByText(
        "Loading coding assessment questions and workspace from server..."
      )
    ).toBeInTheDocument();
  });
});
