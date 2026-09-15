import CodeEditor from "./CodeEditor";
import LanguageSelector from "./LanguageSelector";
import ConsoleTabs from "./ConsoleTabs";
import { isMacPlatform } from "../hooks/useKeyboardShortcuts";
import { SUPPORTED_LANGUAGES } from "../constants";

function EditorPanel({
  code,
  questionId,
  selectedLanguage = "java",
  onLanguageChange,
  languages = SUPPORTED_LANGUAGES,
  onCodeChange,
  onRunCode,
  onSubmit,
  isRunning = false,
  isLocked = false,
  customInput = "",
  onCustomInputChange,
  executionResult = null,
  activeLanguageName = "",
  currentQuestionIndex = 0,
  children,
}) {
  return (
    <section className="flex flex-col overflow-y-auto min-h-0 p-7 md:col-span-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Your solution</h2>
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          languages={languages}
          disabled={isLocked}
        />
      </div>

      <div
        className={`mt-4 min-h-[220px] flex-1 overflow-hidden rounded-md border shadow-sm transition-opacity ${
          isLocked
            ? "border-slate-800 bg-gray-950/80 opacity-75 cursor-not-allowed"
            : "border-slate-700 bg-gray-900"
        }`}
      >
        <CodeEditor
          value={code}
          onChange={onCodeChange}
          language={selectedLanguage}
          questionId={questionId}
          readOnly={isLocked}
          onRunCode={onRunCode}
          onSubmit={onSubmit}
        />
      </div>

      <ConsoleTabs
        key={questionId}
        customInput={customInput}
        onCustomInputChange={onCustomInputChange}
        disabled={isLocked}
        isRunning={isRunning}
        executionResult={executionResult}
        languageName={activeLanguageName}
        questionNumber={currentQuestionIndex + 1}
      />

      {children}

      <div className="mt-4.5 flex flex-shrink-0 justify-end gap-3 pb-1">
        <button
          type="button"
          onClick={onRunCode}
          disabled={isLocked || isRunning}
          title={`Run code (${isMacPlatform() ? "⌘ + Enter" : "Ctrl + Enter"})`}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          className="cursor-pointer rounded-md bg-gray-200 px-4.5 py-2.5 font-semibold text-gray-800 transition enabled:hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Running…" : "Run code"}
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLocked || isRunning}
          title={`Submit solution (${isMacPlatform() ? "⌘ + Shift + Enter" : "Ctrl + Shift + Enter"})`}
          aria-keyshortcuts="Control+Shift+Enter Meta+Shift+Enter"
          className="cursor-pointer rounded-md bg-blue-600 px-4.5 py-2.5 font-semibold text-white transition enabled:hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit solution
        </button>
      </div>
    </section>
  );
}

export default EditorPanel;
