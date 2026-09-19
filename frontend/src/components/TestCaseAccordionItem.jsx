import {
  Loader2,
  CheckCircle2,
  XCircle,
  Circle,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { formatValue } from "../utils/formatValue";

/**
 * Formats structured input objects into key-value lines for display.
 *
 * @param {Object|string} inputs - Map of input parameter names to values, or raw string
 * @returns {string} Formatted newline-delimited string representation
 */
function formatInputs(inputs) {
  if (!inputs || typeof inputs !== "object") return String(inputs ?? "");
  return Object.entries(inputs)
    .map(([k, v]) => `${k} = ${formatValue(v)}`)
    .join("\n");
}

/**
 * Presentational accordion row for an individual test case in the sequential evaluation list.
 *
 * @param {Object} props
 * @param {Object} props.c - Test case result object
 * @param {number} props.idx - Zero-based index of this test case
 * @param {boolean} props.isEvaluated - True if evaluation for this case has completed
 * @param {boolean} props.isCurrent - True if this test case is currently being evaluated
 * @param {boolean} props.isExpanded - True if this test case accordion panel is expanded
 * @param {number} props.firstFailureIdx - Index of the first failing test case (-1 if none)
 * @param {Function} props.onToggle - Callback when clicking the row trigger
 */
function TestCaseAccordionItem({
  c,
  idx,
  isEvaluated,
  isCurrent,
  isExpanded,
  firstFailureIdx,
  onToggle,
}) {
  let icon;
  let badgeText;
  let badgeStyle;
  let rowBorder;

  if (isEvaluated) {
    if (c.passed) {
      icon = (
        <CheckCircle2
          className="h-4 w-4 text-emerald-600 shrink-0"
          aria-hidden="true"
        />
      );
      badgeText = "Passed";
      badgeStyle = "text-emerald-700 bg-emerald-50 border-emerald-200/80";
      rowBorder = isExpanded
        ? "border-emerald-300 ring-1 ring-emerald-200"
        : "border-slate-200 hover:border-emerald-200";
    } else {
      icon = (
        <XCircle
          className="h-4 w-4 text-red-600 shrink-0"
          aria-hidden="true"
        />
      );
      badgeText = "Failed";
      badgeStyle = "text-red-700 bg-red-50 border-red-200/80";
      rowBorder = isExpanded
        ? "border-red-300 ring-1 ring-red-200"
        : "border-slate-200 hover:border-red-200";
    }
  } else if (isCurrent) {
    icon = (
      <Loader2
        className="h-4 w-4 animate-spin text-blue-600 shrink-0"
        aria-hidden="true"
      />
    );
    badgeText = "Evaluating…";
    badgeStyle = "text-blue-700 bg-blue-50 border-blue-200";
    rowBorder = "border-blue-300 ring-1 ring-blue-100";
  } else {
    icon = (
      <Circle
        className="h-4 w-4 text-slate-300 shrink-0"
        aria-hidden="true"
      />
    );
    badgeText =
      firstFailureIdx !== -1 && idx > firstFailureIdx
        ? "Stopped"
        : "Pending";
    badgeStyle = "text-slate-500 bg-slate-100 border-slate-200";
    rowBorder = "border-slate-200/60 opacity-75";
  }

  return (
    <div
      key={c.id || idx}
      className={`overflow-hidden rounded-lg bg-white border transition-all duration-150 ${rowBorder} shadow-2xs`}
    >
      {/* Row Header / Tab Trigger */}
      <button
        type="button"
        role="tab"
        id={`case-tab-${idx}`}
        aria-selected={isExpanded}
        aria-expanded={isExpanded}
        aria-controls={`case-panel-${idx}`}
        onClick={() => onToggle(idx)}
        className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon}
          <span className="text-xs font-semibold text-slate-800 truncate">
            {`Test Case ${idx + 1}`}
          </span>
          {c.name && c.name !== `Test Case ${idx + 1}` && (
            <span className="sr-only">{c.name}</span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeStyle}`}
          >
            {badgeText}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {c.executionTime !== undefined &&
            c.executionTime !== null &&
            isEvaluated && (
              <span className="text-[11px] text-slate-500 tabular-nums">
                {c.executionTime} ms
              </span>
            )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180 text-slate-600" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div
          id={`case-panel-${idx}`}
          role="tabpanel"
          aria-labelledby={`case-tab-${idx}`}
          className="border-t border-slate-100 bg-slate-50/50 p-3.5"
        >
          {c.hidden ? (
            <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3.5">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-slate-500"
                aria-hidden="true"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                    Hidden Test Case
                  </span>
                  {isEvaluated && (
                    <span
                      className={`text-xs font-semibold ${
                        c.passed
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {c.passed ? "✓ Passed" : "✗ Failed"}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  This test case is hidden to maintain assessment integrity. Inputs and expected output values are kept exclusively on the server.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {c.inputs !== undefined && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 font-sans uppercase tracking-wider select-none mb-1">
                    Input
                  </p>
                  <pre className="rounded bg-white p-2.5 border border-slate-200 whitespace-pre-wrap break-words text-slate-800">
                    {formatInputs(c.inputs)}
                  </pre>
                </div>
              )}

              {c.output !== undefined && isEvaluated && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 font-sans uppercase tracking-wider select-none mb-1">
                    Your Output
                  </p>
                  <pre
                    className={`rounded p-2.5 border whitespace-pre-wrap break-words ${
                      c.passed
                        ? "bg-white border-slate-200 text-slate-800"
                        : "bg-red-50/60 border-red-200 text-red-900"
                    }`}
                  >
                    {c.output || "(empty)"}
                  </pre>
                </div>
              )}

              {c.expected !== undefined && isEvaluated && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 font-sans uppercase tracking-wider select-none mb-1">
                    Expected Output
                  </p>
                  <pre className="rounded bg-white p-2.5 border border-slate-200 whitespace-pre-wrap break-words text-slate-800">
                    {formatValue(c.expected)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TestCaseAccordionItem;
