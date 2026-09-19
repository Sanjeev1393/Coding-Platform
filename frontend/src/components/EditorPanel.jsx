import CodeEditor from "./CodeEditor";
import LanguageSelector from "./LanguageSelector";
import ConsoleTabs from "./ConsoleTabs";
import { isMacPlatform } from "../hooks/useKeyboardShortcuts";
import { SUPPORTED_LANGUAGES } from "../constants";

/**
 * EditorPanel renders the code editing workspace, language picker combobox,
 * tabbed console panel (test cases and execution outputs), and action buttons
 * (Run Code and Submit Solution).
 *
 * @param {Object} props
 * @param {string} props.code - Source code currently present in the editor
 * @param {string} props.questionId - Unique ID of the active problem
 * @param {string} [props.selectedLanguage="java"] - Identifier of active programming language
 * @param {Function} props.onLanguageChange - Callback when candidate changes language
 * @param {Array<Object>} [props.languages=SUPPORTED_LANGUAGES] - Supported language definitions
 * @param {Function} props.onCodeChange - Callback when candidate types in the editor
 * @param {Function} props.onRunCode - Callback when Run Code button or shortcut is triggered
 * @param {Function} props.onSubmit - Callback when Submit Solution is triggered
 * @param {boolean} [props.isRunning=false] - True if either run or submit is in flight
 * @param {boolean} [props.isRunningCode=false] - True specifically during single Run Code
 * @param {boolean} [props.isSubmitting=false] - True specifically during Submit Solution
 * @param {boolean} [props.isLocked=false] - True if assessment is locked (read-only)
 * @param {string} [props.customInput=""] - Custom standard input string
 * @param {Function} props.onCustomInputChange - Callback when custom input is edited
 * @param {Object|null} [props.executionResult=null] - Execution or judging outcome
 * @param {string} [props.activeLanguageName=""] - Display name of active language
 * @param {number} [props.currentQuestionIndex=0] - 0-based question index
 * @param {Array<Object>} [props.testCases=[]] - Visible test cases for the problem
 * @param {number} [props.selectedCaseIndex=0] - Selected testcase tab index
 * @param {Function} props.onSelectCase - Callback when selecting a testcase tab
 * @param {React.ReactNode} [props.children] - Optional children elements
 */
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
  isRunningCode = false,
  isSubmitting = false,
  isLocked = false,
  customInput = "",
  onCustomInputChange,
  executionResult = null,
  activeLanguageName = "",
  currentQuestionIndex = 0,
  testCases = [],
  selectedCaseIndex = 0,
  onSelectCase,
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
        testCases={testCases}
        selectedCaseIndex={selectedCaseIndex}
        onSelectCase={onSelectCase}
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
          {isRunningCode || (isRunning && !isSubmitting)
            ? "Running…"
            : "Run code"}
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLocked || isRunning}
          title={`Submit solution (${isMacPlatform() ? "⌘ + Shift + Enter" : "Ctrl + Shift + Enter"})`}
          aria-keyshortcuts="Control+Shift+Enter Meta+Shift+Enter"
          className="cursor-pointer rounded-md bg-blue-600 px-4.5 py-2.5 font-semibold text-white transition enabled:hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting…" : "Submit solution"}
        </button>
      </div>
    </section>
  );
}

export default EditorPanel;
