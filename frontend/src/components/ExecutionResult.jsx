import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatValue } from "../utils/formatValue";

function formatInputs(inputs) {
  if (!inputs || typeof inputs !== "object") return String(inputs ?? "");
  return Object.entries(inputs)
    .map(([k, v]) => `${k} = ${formatValue(v)}`)
    .join("\n");
}

function ExecutionResult({
  result,
  isRunning = false,
  languageName,
  questionNumber,
  className = "",
}) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  if (isRunning) {
    const runningMessage =
      languageName && questionNumber
        ? `Running Question ${questionNumber} using ${languageName}…`
        : languageName
          ? `Running test cases using ${languageName}…`
          : "Executing code…";

    return (
      <div
        role="region"
        aria-label="Execution result"
        className={`${className || "mt-4"} flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-900`}
      >
        <Loader2
          className="h-5 w-5 animate-spin text-blue-600"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold">Executing code…</p>
          <p className="mt-0.5 text-xs text-blue-700">{runningMessage}</p>
        </div>
      </div>
    );
  }

  const status = result?.status ?? "idle";

  if (status === "idle" || !result) {
    return null;
  }

  if (status === "error") {
    const errorType = result.errorType || "error";
    const errorTitle =
      errorType === "compilation"
        ? "Compilation Error"
        : errorType === "runtime"
          ? "Runtime Error"
          : "Error";

    const errorSubtitle =
      errorType === "compilation"
        ? "Compiler error details"
        : errorType === "runtime"
          ? "Runtime exception details"
          : "Error details";

    return (
      <div
        role="region"
        aria-label="Execution result"
        className={`${className || "mt-4"} rounded-md border border-red-200 bg-red-50 p-4 text-red-800`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-red-700">✗ {errorTitle}</span>
            {errorType !== "error" && (
              <span className="rounded bg-red-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-red-800 uppercase tracking-wider">
                {errorType === "compilation" ? "Compile-time" : "Runtime"}
              </span>
            )}
          </div>
          {result.language && (
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              {result.language}
            </span>
          )}
        </div>
        <p className="mt-2.5 text-xs font-medium uppercase tracking-wider text-red-600">
          {errorSubtitle}
        </p>
        <pre className="mt-1 max-h-[160px] overflow-y-auto rounded-md bg-white p-3 font-mono text-sm text-red-700 border border-red-100 whitespace-pre-wrap">
          {result.error || "An unexpected error occurred during execution."}
        </pre>
      </div>
    );
  }

  const isWrongAnswer = status === "wrong_answer";
  const title = isWrongAnswer
    ? "Wrong Answer"
    : status === "accepted"
      ? "Accepted"
      : "Success";

  const containerBg = isWrongAnswer
    ? "border-red-200 bg-red-50/60"
    : "border-green-200 bg-green-50";
  const titleColor = isWrongAnswer ? "text-red-700" : "text-green-700";
  const badgeBg = isWrongAnswer ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";

  const cases = Array.isArray(result.cases) ? result.cases : null;
  const safeIdx =
    cases && selectedCaseIdx >= 0 && selectedCaseIdx < cases.length
      ? selectedCaseIdx
      : 0;
  const activeCase = cases ? cases[safeIdx] : null;

  return (
    <div
      role="region"
      aria-label="Execution result"
      className={`${className || "mt-4"} rounded-md border ${containerBg} p-4 text-slate-800`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${titleColor}`}>
            {isWrongAnswer ? "✗" : "✓"} {title}
          </span>
          {result.passedCount !== undefined && result.totalCount !== undefined && (
            <span className="text-xs text-slate-500">
              ({result.passedCount} / {result.totalCount} test cases passed)
            </span>
          )}
          {result.executionTime !== undefined &&
            result.executionTime !== null && (
              <span className="text-xs text-slate-500">
                • Execution time:{" "}
                {typeof result.executionTime === "number"
                  ? `${result.executionTime} ms`
                  : result.executionTime}
              </span>
            )}
        </div>
        {result.language && (
          <span className={`rounded ${badgeBg} px-2 py-0.5 text-xs font-semibold`}>
            {result.language}
          </span>
        )}
      </div>

      {/* Multi-case sub-tabs if present */}
      {cases && cases.length > 1 && (
        <div
          role="tablist"
          aria-label="Result case selector"
          className="mt-3 flex items-center gap-2 border-b border-slate-200/70 pb-2"
        >
          {cases.map((c, idx) => {
            const isSelected = idx === safeIdx;
            return (
              <button
                key={c.id || idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCaseIdx(idx)}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected
                    ? "bg-white shadow-xs text-slate-900 ring-1 ring-slate-200"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    c.passed ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {c.passed ? "✓" : "✗"}
                </span>
                <span>{c.name || `Case ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Case Details */}
      {activeCase ? (
        <div className="mt-3 space-y-2.5">
          <div>
            <p className="text-xs font-medium text-slate-600">Input</p>
            <pre className="mt-1 rounded-md bg-white p-2.5 font-mono text-xs text-slate-800 border border-slate-200 whitespace-pre-wrap">
              {formatInputs(activeCase.inputs || activeCase.input)}
            </pre>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-600">Your Output</p>
            <pre
              className={`mt-1 rounded-md bg-white p-2.5 font-mono text-xs border whitespace-pre-wrap ${
                activeCase.passed
                  ? "text-slate-800 border-slate-200"
                  : "text-red-700 font-semibold border-red-200 bg-red-50/30"
              }`}
            >
              {activeCase.output !== undefined && activeCase.output !== null && activeCase.output !== ""
                ? activeCase.output
                : "No output returned"}
            </pre>
          </div>

          {activeCase.expected !== undefined && (
            <div>
              <p className="text-xs font-medium text-slate-600">Expected Output</p>
              <pre className="mt-1 rounded-md bg-white p-2.5 font-mono text-xs text-slate-800 border border-slate-200 whitespace-pre-wrap">
                {formatValue(activeCase.expected)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <>
          {result.input !== undefined &&
            result.input !== null &&
            result.input.trim() !== "" && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-600">Custom Input</p>
                <pre className="mt-1 max-h-[120px] overflow-y-auto rounded-md bg-white p-2.5 font-mono text-xs text-slate-800 border border-green-100 whitespace-pre-wrap">
                  {result.input}
                </pre>
              </div>
            )}

          <div className="mt-3">
            <p className="text-xs font-medium text-slate-600">Output</p>
            <pre className="mt-1 max-h-[160px] overflow-y-auto rounded-md bg-white p-3 font-mono text-sm text-slate-800 border border-green-100 whitespace-pre-wrap">
              {result.output || "No output returned."}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

export default ExecutionResult;
