import "@testing-library/jest-dom/vitest";
import React from "react";

// Mock @monaco-editor/react for JSDOM test environment
vi.mock("@monaco-editor/react", () => {
  return {
    default: function MockMonacoEditor({
      value,
      onChange,
      options,
      path,
      ...rest
    }) {
      return React.createElement("textarea", {
        "data-testid": "mock-monaco-editor",
        "data-path": path,
        "aria-label": "Code editor",
        value: value ?? "",
        disabled: Boolean(options?.readOnly),
        onChange: (e) => onChange?.(e.target.value),
        ...rest,
      });
    },
  };
});
