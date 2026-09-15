import { useState } from "react";
import ConsoleTabBar from "./ConsoleTabBar";
import CustomInputPanel from "./CustomInputPanel";
import ExecutionResult from "./ExecutionResult";

/**
 * ConsoleTabs orchestrates the candidate's custom input and test execution result
 * in a unified, tabbed interface below the code editor.
 *
 * @param {Object} props
 * @param {string} props.customInput - Stored custom input for the active question.
 * @param {Function} props.onCustomInputChange - Change handler for custom input textarea.
 * @param {boolean} props.disabled - True if assessment is locked/expired/submitted.
 * @param {boolean} props.isRunning - True while code is executing.
 * @param {Object|null} props.executionResult - Result object ({ status, output, error, ... }).
 * @param {string} props.languageName - Display name of active language (e.g. "Java").
 * @param {number} props.questionNumber - Active question 1-based number.
 * @param {boolean} props.defaultOpen - Initial open state (default: false).
 */
function ConsoleTabs({
  customInput = "",
  onCustomInputChange,
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
  const initialActiveTab = isRunning || hasResult ? "result" : "input";

  const [isOpen, setIsOpen] = useState(shouldOpenInitially);
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  const isSuccess = executionResult?.status === "success";
  const isError = executionResult?.status === "error";
  const hasInput = typeof customInput === "string" && customInput.trim() !== "";

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

  const handleSelectInputTab = () => {
    if (disabled) return;
    if (isOpen && activeTab === "input") {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setActiveTab("input");
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
        hasInput={hasInput}
        hasResult={hasResult}
        isRunning={isRunning}
        isSuccess={isSuccess}
        isError={isError}
        disabled={disabled}
        onSelectInputTab={handleSelectInputTab}
        onSelectResultTab={handleSelectResultTab}
        onToggleOpen={handleToggleOpen}
      />

      {isOpen && (
        <div className="max-h-[280px] overflow-y-auto bg-white">
          <div
            id="panel-custom-input"
            aria-labelledby="tab-custom-input"
            className={activeTab === "input" ? "flex flex-col" : "hidden"}
          >
            <CustomInputPanel
              value={customInput}
              onChange={onCustomInputChange}
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
