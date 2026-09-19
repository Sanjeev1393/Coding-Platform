import { FlaskConical, Loader2, ChevronDown } from "lucide-react";

/**
 * ConsoleTabBar renders the interactive tab bar for Testcase, Test Result,
 * and the expand/collapse auxiliary toggle.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether console panel is expanded.
 * @param {string} props.activeTab - Currently active tab ('testcase' | 'result').
 * @param {boolean} props.hasResult - Whether an execution result is present.
 * @param {boolean} props.isRunning - Whether code is actively executing.
 * @param {string|null} props.resultStatus - Status of result ('accepted' | 'wrong_answer' | 'error' | 'success').
 * @param {boolean} props.disabled - Whether tabs are disabled (e.g. locked).
 * @param {Function} props.onSelectTestcaseTab - Callback when Testcase tab is clicked.
 * @param {Function} props.onSelectResultTab - Callback when Test Result tab is clicked.
 * @param {Function} props.onToggleOpen - Callback to toggle open/collapse.
 */
function ConsoleTabBar({
  isOpen,
  activeTab,
  hasResult,
  isRunning,
  resultStatus,
  disabled,
  onSelectTestcaseTab,
  onSelectResultTab,
  onToggleOpen,
}) {
  const isAccepted = resultStatus === "accepted" || resultStatus === "success";
  const isWrongAnswer = resultStatus === "wrong_answer";
  const isError = resultStatus === "error";

  return (
    <div className="flex items-center justify-between border-b border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5">
      <div aria-label="Console tabs" className="flex items-center gap-1.5">
        {/* Testcase Tab */}
        <button
          type="button"
          id="tab-testcase"
          aria-selected={isOpen && activeTab === "testcase"}
          aria-expanded={isOpen && activeTab === "testcase"}
          aria-controls="panel-testcase"
          onClick={onSelectTestcaseTab}
          disabled={disabled}
          className={`group inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
            isOpen && activeTab === "testcase"
              ? "bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80"
              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-800"
          }`}
        >
          <FlaskConical
            className={`h-3.5 w-3.5 transition-colors ${
              isOpen && activeTab === "testcase"
                ? "text-blue-600"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
            aria-hidden="true"
          />
          <span>Testcase</span>
        </button>

        {/* Test Result Tab (Enabled/Visible during execution or when a result exists) */}
        {(hasResult || isRunning) && (
          <button
            type="button"
            id="tab-test-result"
            aria-selected={isOpen && activeTab === "result"}
            aria-expanded={isOpen && activeTab === "result"}
            aria-controls="panel-test-result"
            onClick={onSelectResultTab}
            disabled={disabled}
            className={`group inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              isOpen && activeTab === "result"
                ? "bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-800"
            }`}
          >
            {isRunning ? (
              <Loader2
                className="h-3.5 w-3.5 animate-spin text-blue-600"
                aria-hidden="true"
              />
            ) : isAccepted ? (
              <span className="text-xs font-bold text-emerald-600">✓</span>
            ) : isWrongAnswer ? (
              <span className="text-xs font-bold text-red-600">✗</span>
            ) : isError ? (
              <span className="text-xs font-bold text-red-600">✗</span>
            ) : null}

            <span>Test Result</span>

            {isAccepted && (
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                Accepted
              </span>
            )}
            {isWrongAnswer && (
              <span className="rounded-full bg-red-50 px-1.5 py-0.2 text-[10px] font-medium text-red-700 border border-red-200">
                Wrong Answer
              </span>
            )}
            {isError && (
              <span className="rounded-full bg-red-50 px-1.5 py-0.2 text-[10px] font-medium text-red-700 border border-red-200">
                Error
              </span>
            )}
          </button>
        )}
      </div>

      {/* Console Collapse / Expand Auxiliary Control */}
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggleOpen}
        disabled={disabled}
        aria-label={isOpen ? "Collapse console" : "Expand console"}
        className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:bg-slate-100/80 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{isOpen ? "Collapse" : "Expand"}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default ConsoleTabBar;
