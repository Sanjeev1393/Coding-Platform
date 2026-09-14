import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditorPanel from "./EditorPanel";

// ─── Shared test data ─────────────────────────────────────────────────────────

const STARTER_CODE = "public class Solution {\n    // write your code here\n}";

// Helper: render EditorPanel with sensible defaults that can be overridden
function renderEditor(overrides = {}) {
  const defaults = {
    code: STARTER_CODE,
    onCodeChange: vi.fn(),
    onRunCode: vi.fn(),
    onSubmit: vi.fn(),
    isRunning: false,
    isLocked: false,
  };

  return render(<EditorPanel {...defaults} {...overrides} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("EditorPanel", () => {
  // ─── core behaviour ──────────────────────────────────────────────────────

  describe("core behaviour", () => {
    test("textarea contains the supplied starter code", () => {
      renderEditor();

      expect(
        screen.getByRole("textbox", { name: "Code editor" })
      ).toHaveValue(STARTER_CODE);
    });

    test("typing in the editor calls onCodeChange with the new value", async () => {
      const user = userEvent.setup();
      const onCodeChange = vi.fn();

      renderEditor({ code: "", onCodeChange });

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      await user.type(editor, "hello");

      // EditorPanel is a controlled component — it passes e.target.value
      // straight to onCodeChange.  Because `code` prop never updates in this
      // test (no real state above), each keystroke fires one call.
      expect(onCodeChange).toHaveBeenCalledTimes(5);
      // Each individual call receives exactly one character
      expect(onCodeChange).toHaveBeenNthCalledWith(1, "h");
      expect(onCodeChange).toHaveBeenNthCalledWith(5, "o");
    });

    test("clicking Run Code calls onRunCode once", async () => {
      const user = userEvent.setup();
      const onRunCode = vi.fn();

      renderEditor({ onRunCode });
      await user.click(screen.getByRole("button", { name: "Run code" }));

      expect(onRunCode).toHaveBeenCalledTimes(1);
    });

    test("clicking Submit Solution calls onSubmit once", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      renderEditor({ onSubmit });
      await user.click(screen.getByRole("button", { name: "Submit solution" }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    test("Run Code button shows 'Running…' label while isRunning is true", () => {
      renderEditor({ isRunning: true });

      // Old label must be gone; new label must be present
      expect(
        screen.queryByRole("button", { name: "Run code" })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Running…" })
      ).toBeInTheDocument();
    });
  });

  // ─── edge cases ──────────────────────────────────────────────────────────

  describe("edge cases", () => {
    test("all interactive elements are disabled when isLocked is true (submitted state)", () => {
      // isLocked is the single prop that covers submitted, expired, and
      // mid-run states.  When true, the editor and both buttons must be
      // inoperable — we should not be able to call any callbacks.
      const onCodeChange = vi.fn();
      const onRunCode = vi.fn();
      const onSubmit = vi.fn();

      renderEditor({ isLocked: true, onCodeChange, onRunCode, onSubmit });

      expect(screen.getByRole("textbox", { name: "Code editor" })).toBeDisabled();
      expect(screen.getByRole("button", { name: /run code|running/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Submit solution" })).toBeDisabled();
    });

    test("clicking Submit while locked does not call onSubmit (cannot submit repeatedly)", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      renderEditor({ isLocked: true, onSubmit });
      await user.click(screen.getByRole("button", { name: "Submit solution" }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    test("editor and buttons are locked when timer has expired (isLocked=true)", () => {
      // The parent passes isLocked=true when time runs out.
      // This test documents the expiry rule: no interaction is possible.
      renderEditor({ isLocked: true });

      expect(screen.getByRole("textbox", { name: "Code editor" })).toBeDisabled();
      expect(screen.getByRole("button", { name: /run code|running/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Submit solution" })).toBeDisabled();
    });

    test("editor and action buttons are locked while code execution is running (isRunning=true, isLocked=true)", () => {
      renderEditor({ isRunning: true, isLocked: true });

      expect(screen.getByRole("textbox", { name: "Code editor" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Running…" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Submit solution" })).toBeDisabled();
    });

    test("textarea is findable by its accessible label 'Code editor'", () => {
      renderEditor();

      // aria-label="Code editor" must be present so screen-reader users
      // can identify the editing region.
      expect(
        screen.getByRole("textbox", { name: "Code editor" })
      ).toBeInTheDocument();
    });

    test("selected language label is visible", () => {
      renderEditor();

      expect(screen.getByText("Java")).toBeInTheDocument();
    });

    test("Run Code and Submit are still reachable with an empty code string", async () => {
      // EditorPanel is a pure presentation component — it does not validate
      // whether code is empty.  Validation responsibility belongs to the
      // parent (App.jsx).  We document that with empty code the buttons are
      // still enabled and their callbacks still fire.
      const user = userEvent.setup();
      const onRunCode = vi.fn();
      const onSubmit = vi.fn();

      renderEditor({ code: "", onRunCode, onSubmit });

      await user.click(screen.getByRole("button", { name: "Run code" }));
      await user.click(screen.getByRole("button", { name: "Submit solution" }));

      expect(onRunCode).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    test("action buttons can be found by their accessible names", () => {
      renderEditor();
      expect(
        screen.getByRole("button", { name: "Run code" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Submit solution" })
      ).toBeInTheDocument();
    });

    test("textarea has an accessible label", () => {
      renderEditor();
      const editor = screen.getByRole("textbox", { name: "Code editor" });
      expect(editor).toBeInTheDocument();
      expect(screen.getByLabelText("Code editor")).toBe(editor);
    });

    test("action buttons and textarea use native disabled attribute when locked", () => {
      renderEditor({ isLocked: true });

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      const runBtn = screen.getByRole("button", { name: /run code/i });
      const submitBtn = screen.getByRole("button", { name: "Submit solution" });

      expect(editor).toHaveAttribute("disabled");
      expect(runBtn).toHaveAttribute("disabled");
      expect(submitBtn).toHaveAttribute("disabled");
      expect(editor).toBeDisabled();
      expect(runBtn).toBeDisabled();
      expect(submitBtn).toBeDisabled();
    });

    test("panel heading follows logical hierarchy (h2 for panel title)", () => {
      renderEditor();
      expect(
        screen.getByRole("heading", { level: 2, name: "Your solution" })
      ).toBeInTheDocument();
    });

    test("interactive elements can be navigated via keyboard and display visible focus rings", async () => {
      const user = userEvent.setup();
      renderEditor();

      const editor = screen.getByRole("textbox", { name: "Code editor" });
      const runBtn = screen.getByRole("button", { name: "Run code" });
      const submitBtn = screen.getByRole("button", { name: "Submit solution" });

      await user.tab();
      expect(editor).toHaveFocus();

      await user.tab();
      expect(runBtn).toHaveFocus();
      expect(runBtn.className).toMatch(/focus-visible:ring-2/);

      await user.tab();
      expect(submitBtn).toHaveFocus();
      expect(submitBtn.className).toMatch(/focus-visible:ring-2/);
    });

    test("passes questionId to configure unique Monaco model path", () => {
      renderEditor({ questionId: "two-sum" });
      const editor = screen.getByRole("textbox", { name: "Code editor" });
      expect(editor).toHaveAttribute("data-path", "question-two-sum.java");
    });
  });
});
