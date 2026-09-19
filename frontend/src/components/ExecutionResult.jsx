import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import ExecutionResultBanner from "./ExecutionResultBanner";
import TestCaseAccordionItem from "./TestCaseAccordionItem";

/**
 * ExecutionResult coordinates the display of running spinners, compilation/runtime
 * error outputs, and the sequential step-through test case evaluation accordion.
 *
 * @param {Object} props
 * @param {Object|null} props.result - Execution outcome from runSolution or submitSolution
 * @param {boolean} [props.isRunning=false] - True while execution is actively running
 * @param {string} [props.languageName=""] - Display name of the active language
 * @param {number} [props.questionNumber=1] - 1-based index of the active question
 * @param {string} [props.className=""] - Optional extra CSS container classes
 */
function ExecutionResult({
  result,
  isRunning = false,
  languageName,
  questionNumber,
  className = "",
}) {
  const cases = useMemo(
    () => (Array.isArray(result?.cases) ? result.cases : null),
    [result?.cases]
  );

  const isTestEnv = useMemo(
    () =>
      typeof window !== "undefined" &&
      (navigator.userAgent.includes("jsdom") ||
        Boolean(
          window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
        )),
    []
  );

  const firstFailureIdx = useMemo(
    () => (cases ? cases.findIndex((c) => !c.passed) : -1),
    [cases]
  );

  const targetEndIdx = useMemo(
    () =>
      cases
        ? firstFailureIdx !== -1
          ? firstFailureIdx
          : cases.length - 1
        : -1,
    [cases, firstFailureIdx]
  );

  const skipAnimation = Boolean(result?.skipAnimation) || isTestEnv;

  const [animatingCount, setAnimatingCount] = useState(0);
  const [userExpandedIdx, setUserExpandedIdx] = useState(null);

  const isAnimationDone = skipAnimation || animatingCount > targetEndIdx;
  const isEvaluating = Boolean(cases) && !isAnimationDone;
  const evaluatedCount = isAnimationDone ? targetEndIdx + 1 : animatingCount;

  const expandedCaseIdx = userExpandedIdx !== null ? userExpandedIdx : 0;

  // Sequential progression effect in browser environments
  useEffect(() => {
    if (skipAnimation || !cases || cases.length === 0) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setAnimatingCount(current);

      if (current > targetEndIdx) {
        clearInterval(interval);
      }
    }, 260);

    return () => clearInterval(interval);
  }, [cases, skipAnimation, targetEndIdx]);

  const handleSkipAnimation = () => {
    if (!cases) return;
    setAnimatingCount(targetEndIdx + 1);
  };

  const handleToggleCase = (idx) => {
    setUserExpandedIdx((prev) => {
      const current = prev !== null ? prev : 0;
      return current === idx ? -1 : idx;
    });
  };

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
        className={`${className || "mt-4"} flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900 shadow-xs`}
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
          : "Execution error";

    const badgeLabel =
      errorType === "compilation"
        ? "Compile-time"
        : errorType === "runtime"
          ? "Runtime"
          : "Execution";

    return (
      <div
        role="region"
        aria-label="Execution result"
        className={`${className || "mt-4"} rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 shadow-xs`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-900">✗ {errorTitle}</span>
            <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              {badgeLabel}
            </span>
          </div>
          {result.language && (
            <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              {result.language}
            </span>
          )}
        </div>

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
            {errorSubtitle}
          </p>
          <pre
            tabIndex={0}
            role="region"
            aria-label="Error details"
            className="mt-1.5 max-h-48 overflow-auto rounded bg-white p-3 font-mono text-xs whitespace-pre-wrap break-words text-red-800 border border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {result.error || "An unexpected error occurred."}
          </pre>
        </div>
      </div>
    );
  }

  // Multi-case or Single-run Banner Information
  const isMultiCase = cases && cases.length > 0;
  const isAccepted = status === "accepted" || status === "success";
  const title = isAccepted
    ? status === "success"
      ? "✓ Success"
      : "✓ Accepted"
    : "✗ Wrong Answer";

  const subtitle =
    result.passedCount !== undefined && result.totalCount !== undefined
      ? `(${result.passedCount} / ${result.totalCount} test cases passed)`
      : null;

  const badgeStyle = !isAccepted
    ? "bg-red-100 text-red-800 border-red-200"
    : "bg-green-100 text-green-800 border-green-200";

  const containerBg = isMultiCase
    ? "border-slate-200 bg-white"
    : isAccepted
      ? "border-green-200 bg-green-50"
      : "border-red-200 bg-red-50";

  return (
    <div
      role="region"
      aria-label="Execution result"
      className={`${className || "mt-4"} rounded-lg border ${containerBg} p-4 text-slate-800 shadow-xs`}
    >
      {/* Decomposed Header Banner */}
      <ExecutionResultBanner
        title={title}
        subtitle={subtitle}
        badgeStyle={badgeStyle}
        result={result}
        isEvaluating={isEvaluating}
        casesCount={cases ? cases.length : 0}
        onSkipAnimation={handleSkipAnimation}
      />

      {/* Sequential Test-Case Rows */}
      {isMultiCase ? (
        <div
          role="tablist"
          aria-label="Result case selector"
          className="mt-3.5 space-y-2"
        >
          {cases.map((c, idx) => {
            const isEvaluated = idx < evaluatedCount;
            const isCurrent =
              isEvaluating &&
              idx === evaluatedCount &&
              (firstFailureIdx === -1 || idx <= firstFailureIdx);
            const isExpanded = idx === expandedCaseIdx;

            return (
              <TestCaseAccordionItem
                key={c.id || idx}
                c={c}
                idx={idx}
                isEvaluated={isEvaluated}
                isCurrent={isCurrent}
                isExpanded={isExpanded}
                firstFailureIdx={firstFailureIdx}
                onToggle={handleToggleCase}
              />
            );
          })}
        </div>
      ) : (
        /* Single Run Output (Custom Input mode) */
        <>
          {result.input !== undefined &&
            result.input !== null &&
            result.input.trim() !== "" && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Custom Input
                </p>
                <pre className="mt-1.5 max-h-48 overflow-auto rounded bg-white p-3 font-mono text-xs whitespace-pre-wrap break-words text-slate-800 border border-green-100">
                  {result.input}
                </pre>
              </div>
            )}

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Output
            </p>
            <pre
              tabIndex={0}
              role="region"
              aria-label="Execution output"
              className="mt-1.5 max-h-48 overflow-auto rounded bg-white p-3 font-mono text-xs whitespace-pre-wrap break-words text-slate-800 border border-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {result.output || "No output returned."}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

export default ExecutionResult;
