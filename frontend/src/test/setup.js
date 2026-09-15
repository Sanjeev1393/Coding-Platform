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
      language,
      onMount,
      ...rest
    }) {
      const onMountRef = React.useRef(onMount);
      onMountRef.current = onMount;

      React.useEffect(() => {
        if (typeof onMountRef.current === "function") {
          const mockEditor = {
            addCommand: vi.fn(),
          };
          const mockMonaco = {
            KeyMod: { CtrlCmd: 2048, Shift: 1024 },
            KeyCode: { Enter: 3 },
          };
          onMountRef.current(mockEditor, mockMonaco);
        }
      }, []);

      return React.createElement("textarea", {
        "data-testid": "mock-monaco-editor",
        "data-path": path,
        "data-language": language,
        "aria-label": "Code editor",
        value: value ?? "",
        disabled: Boolean(options?.readOnly),
        onChange: (e) => onChange?.(e.target.value),
        ...rest,
      });
    },
  };
});
