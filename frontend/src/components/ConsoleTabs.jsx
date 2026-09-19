import { useState } from "react";
import ConsoleTabBar from "./ConsoleTabBar";
import TestCasePanel from "./TestCasePanel";
import ExecutionResult from "./ExecutionResult";

/**
 * ConsoleTabs orchestrates the candidate's test cases and test execution result
 * in a unified, tabbed interface below the code editor.
 *
 * @param {Object} props
 * @param {Array<Object>} props.testCases - Visible test cases for the active question.
 * @param {number} props.selectedCaseIndex - Currently selected test case index.
 * @param {Function} props.onSelectCase - Callback when a test case is selected.
 * @param {boolean} props.disabled - True if assessment is locked/expired/submitted.
 * @param {boolean} props.isRunning - True while code is executing.
 * @param {Object|null} props.executionResult - Result object ({ status, output, error, ... }).
 * @param {string} props.languageName - Display name of active language (e.g. "Java").
 * @param {number} props.questionNumber - Active question 1-based number.
 * @param {boolean} props.defaultOpen - Initial open state (default: false).
 */
function ConsoleTabs({
  testCases = [],
  selectedCaseIndex = 0,
  onSelectCase,
  disabled = false,
  isRunning = false,
  executionResult = null,
  languageName = "",
  questionNumber = 1,
  defaultOpen = false,
}) {
  const hasResult =
    Boolean(executionResult) && executionResult.status !== "idle";
  const shouldOpenInitially = defaultOpen || isRunning || hasResult;
  const initialActiveTab = isRunning || hasResult ? "result" : "testcase";

  const [isOpen, setIsOpen] = useState(shouldOpenInitially);
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  const [prevRunState, setPrevRunState] = useState({ isRunning, hasResult });
  if (
    isRunning !== prevRunState.isRunning ||
    hasResult !== prevRunState.hasResult
  ) {
    setPrevRunState({ isRunning, hasResult });
    if (isRunning || hasResult) {
      setIsOpen(true);
      setActiveTab("result");
    }
  }

  const handleSelectTestcaseTab = () => {
    if (disabled) return;
    if (isOpen && activeTab === "testcase") {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setActiveTab("testcase");
    }
  };

  const handleSelectResultTab = () => {
    if (disabled) return;
    if (isOpen && activeTab === "result") {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setActiveTab("result");
    }
  };

  const handleToggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="mt-4 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:border-slate-300">
      <ConsoleTabBar
        isOpen={isOpen}
        activeTab={activeTab}
        hasResult={hasResult}
        isRunning={isRunning}
        resultStatus={executionResult?.status}
        disabled={disabled}
        onSelectTestcaseTab={handleSelectTestcaseTab}
        onSelectResultTab={handleSelectResultTab}
        onToggleOpen={handleToggleOpen}
      />

      {isOpen && (
        <div className="bg-white">
          <div
            id="panel-testcase"
            aria-labelledby="tab-testcase"
            className={activeTab === "testcase" ? "flex flex-col" : "hidden"}
          >
            <TestCasePanel
              testCases={testCases}
              selectedCaseIndex={selectedCaseIndex}
              onSelectCase={onSelectCase}
              disabled={disabled}
            />
          </div>

          <div
            id="panel-test-result"
            aria-labelledby="tab-test-result"
            className={activeTab === "result" ? "p-3" : "hidden"}
          >
            <ExecutionResult
              result={executionResult}
              isRunning={isRunning}
              languageName={languageName}
              questionNumber={questionNumber}
              className="!mt-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsoleTabs;
