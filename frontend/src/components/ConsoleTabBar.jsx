/**
 * ConsoleTabBar renders the interactive tab bar for Custom Input, Test Result,
 * and the expand/collapse auxiliary toggle.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether console panel is expanded.
 * @param {string} props.activeTab - Currently active tab ('input' | 'result').
 * @param {boolean} props.hasInput - Whether custom input contains text.
 * @param {boolean} props.hasResult - Whether an execution result is present.
 * @param {boolean} props.isRunning - Whether code is actively executing.
 * @param {boolean} props.isSuccess - Whether execution succeeded.
 * @param {boolean} props.isError - Whether execution failed with error.
 * @param {boolean} props.disabled - Whether tabs are disabled (e.g. locked).
 * @param {Function} props.onSelectInputTab - Callback when Custom Input tab is clicked.
 * @param {Function} props.onSelectResultTab - Callback when Test Result tab is clicked.
 * @param {Function} props.onToggleOpen - Callback to toggle open/collapse.
 */
function ConsoleTabBar({
  isOpen,
  activeTab,
  hasInput,
  hasResult,
  isRunning,
  isSuccess,
  isError,
  disabled,
  onSelectInputTab,
  onSelectResultTab,
  onToggleOpen,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5">
      <div aria-label="Console tabs" className="flex items-center gap-1.5">
        {/* Custom Input Tab */}
        <button
          type="button"
          id="tab-custom-input"
          aria-selected={isOpen && activeTab === "input"}
          aria-expanded={isOpen && activeTab === "input"}
          aria-controls="panel-custom-input"
          onClick={onSelectInputTab}
          disabled={disabled}
          className={`group inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
            isOpen && activeTab === "input"
              ? "bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/80"
              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-800"
          }`}
        >
          {/* Terminal / Stdin Icon */}
          <svg
            className={`h-3.5 w-3.5 transition-colors ${
              isOpen && activeTab === "input"
                ? "text-blue-600"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l3 3-3 3m5 0h3M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z"
            />
          </svg>

          <span>Custom Input</span>

          {hasInput && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          )}
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
              <svg
                className="h-3.5 w-3.5 animate-spin text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : isError ? (
              <span className="text-xs font-bold text-red-600">✗</span>
            ) : (
              <span className="text-xs font-bold text-emerald-600">✓</span>
            )}

            <span>Test Result</span>

            {isSuccess && (
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.2 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                Passed
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
        <svg
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}

export default ConsoleTabBar;
