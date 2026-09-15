import { useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { getLanguageExtension } from "../utils/languageUtils";

function CodeEditor({
  value,
  onChange,
  language = "java",
  questionId,
  readOnly = false,
  onRunCode,
  onSubmit,
}) {
  const onRunCodeRef = useRef(onRunCode);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onRunCodeRef.current = onRunCode;
    onSubmitRef.current = onSubmit;
  });

  const handleEditorDidMount = useCallback((editor, monaco) => {
    // Monaco intercepts Ctrl+Enter and Ctrl+Shift+Enter in its internal keybinding pipeline.
    // Registering editor commands ensures shortcuts fire while cursor is focused in Monaco.
    // monaco.KeyMod.CtrlCmd maps to Ctrl on Windows/Linux and ⌘ Command on macOS.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunCodeRef.current?.();
    });

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        onSubmitRef.current?.();
      }
    );
  }, []);

  const handleEditorChange = (newValue) => {
    // If editor is locked (running, submitted, or timer up), ignore any changes
    if (readOnly) return;
    // Monaco can occasionally emit undefined on reset; normalize to empty string
    onChange?.(newValue ?? "");
  };

  const extension = getLanguageExtension(language);
  const modelPath = questionId ? `question-${questionId}.${extension}` : undefined;

  return (
    <div className={`relative h-full w-full ${readOnly ? "cursor-not-allowed opacity-80" : ""}`}>
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme="vs-dark"
        path={modelPath}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex h-full w-full items-center justify-center bg-gray-900 text-slate-400">
            <span className="font-mono text-sm">Loading editor…</span>
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 15,
          tabSize: 4,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          readOnly: Boolean(readOnly),
          domReadOnly: Boolean(readOnly),
          renderLineHighlight: readOnly ? "none" : "all",
          cursorBlinking: readOnly ? "solid" : "smooth",
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
          lineNumbers: "on",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}

export default CodeEditor;
