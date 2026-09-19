import { formatValue } from "../utils/formatValue";

/**
 * TestCasePanel renders the interactive test case tabs (Case 1, Case 2, etc.)
 * and the formatted input parameters for the selected test case.
 *
 * @param {Object} props
 * @param {Array<Object>} props.testCases - Visible test cases for the question.
 * @param {number} props.selectedCaseIndex - Currently selected test case index.
 * @param {Function} props.onSelectCase - Callback when a test case tab is clicked.
 * @param {boolean} props.disabled - Whether interaction is disabled.
 */
function TestCasePanel({
  testCases = [],
  selectedCaseIndex = 0,
  onSelectCase,
  disabled = false,
}) {
  if (!testCases || testCases.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500">
        No test cases available for this question.
      </div>
    );
  }

  const safeIndex =
    selectedCaseIndex >= 0 && selectedCaseIndex < testCases.length
      ? selectedCaseIndex
      : 0;
  const activeCase = testCases[safeIndex];
  const inputs = activeCase?.inputs || {};

  return (
    <div className="flex flex-col p-3 bg-white">
      {/* Test Case Selection Tabs (Case 1, Case 2) */}
      <div
        role="tablist"
        aria-label="Test case choices"
        className="flex items-center gap-2 pb-2.5 border-b border-slate-100"
      >
        {testCases.map((tc, idx) => {
          const isSelected = idx === safeIndex;
          const label = `Case ${idx + 1}`;

          return (
            <button
              key={tc.id || `case-${idx}`}
              type="button"
              role="tab"
              id={`test-case-tab-${idx}`}
              aria-selected={isSelected}
              aria-controls={`test-case-panel-${idx}`}
              disabled={disabled}
              onClick={() => onSelectCase?.(idx)}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? "bg-slate-200/90 text-slate-800 shadow-xs font-bold"
                  : "bg-slate-100/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Selected Test Case Inputs Display */}
      <div
        id={`test-case-panel-${safeIndex}`}
        role="tabpanel"
        aria-labelledby={`test-case-tab-${safeIndex}`}
        className="pt-3 space-y-3"
      >
        {Object.entries(inputs).length > 0 ? (
          Object.entries(inputs).map(([paramName, paramVal]) => (
            <div key={paramName}>
              <div className="text-[11px] font-medium text-slate-500">
                {paramName} =
              </div>
              <div className="mt-1 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-1.5 font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre-wrap">
                {formatValue(paramVal)}
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className="text-[11px] font-medium text-slate-500">Input:</div>
            <div className="mt-1 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-1.5 font-mono text-xs text-slate-800">
              {activeCase.rawInput || "No input parameters"}
            </div>
          </div>
        )}

        {/* Expected Output indicator */}
        {activeCase.expectedOutput !== undefined && (
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              Expected Output:
            </div>
            <div className="mt-1 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-1.5 font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre-wrap">
              {formatValue(activeCase.expectedOutput)}
            </div>
          </div>
        )}

        {activeCase.explanation && (
          <p className="text-[11px] text-slate-400 italic pt-1">
            Note: {activeCase.explanation}
          </p>
        )}
      </div>
    </div>
  );
}

export default TestCasePanel;
