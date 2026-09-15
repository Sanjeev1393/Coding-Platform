import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomInputPanel from "./CustomInputPanel";

describe("CustomInputPanel", () => {
  test("renders textarea with accessible label and placeholder", () => {
    render(<CustomInputPanel value="" onChange={vi.fn()} />);

    const textarea = screen.getByRole("textbox", { name: "Custom Input" });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute(
      "placeholder",
      "Enter input for your program"
    );
    expect(textarea).toHaveValue("");
  });

  test("displays supplied value and computes line count correctly", () => {
    render(
      <CustomInputPanel value={"line1\nline2\nline3"} onChange={vi.fn()} />
    );

    const textarea = screen.getByRole("textbox", { name: "Custom Input" });
    expect(textarea).toHaveValue("line1\nline2\nline3");
    expect(screen.getByText(/3 lines/i)).toBeInTheDocument();
  });

  test("singular line text for single line input", () => {
    render(<CustomInputPanel value="single line" onChange={vi.fn()} />);

    expect(screen.getByText(/1 line/i)).toBeInTheDocument();
  });

  test("typing calls onChange with the input event", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CustomInputPanel value="" onChange={onChange} />);

    const textarea = screen.getByRole("textbox", { name: "Custom Input" });
    await user.type(textarea, "hi");

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  test("clicking Clear button resets input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CustomInputPanel value="some data" onChange={onChange} />);

    const clearBtn = screen.getByRole("button", { name: "Clear" });
    expect(clearBtn).toBeInTheDocument();
    await user.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith({
      target: { value: "" },
    });
  });

  test("all interactive elements are disabled when disabled prop is true", () => {
    render(<CustomInputPanel value="some data" onChange={vi.fn()} disabled={true} />);

    const textarea = screen.getByRole("textbox", { name: "Custom Input" });
    expect(textarea).toBeDisabled();

    // Clear button should not be rendered when disabled
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });
});
