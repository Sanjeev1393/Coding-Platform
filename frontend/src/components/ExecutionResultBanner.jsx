import { Zap } from "lucide-react";

/**
 * Presentational banner component summarizing the verdict, passed/total count,
 * runtime/memory metrics, skip animation trigger, and language badge.
 *
 * @param {Object} props
 * @param {string} props.title - Main display title (e.g. 'Accepted', 'Wrong Answer', 'Success')
 * @param {string} props.subtitle - Contextual subtitle (e.g. '(4 / 5 test cases passed)')
 * @param {string} props.badgeStyle - Tailwind styling classes for the status badge
 * @param {Object} props.result - Raw execution result object
 * @param {boolean} props.isEvaluating - True while sequential animation is actively running
 * @param {number} props.casesCount - Total count of test cases
 * @param {Function} props.onSkipAnimation - Callback to skip remaining animation steps
 * @returns {JSX.Element} The rendered execution result header banner
 */
function ExecutionResultBanner({
  title,
  subtitle,
  badgeStyle,
  result,
  isEvaluating,
  casesCount,
  onSkipAnimation,
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        {subtitle && (
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            {subtitle}
          </span>
        )}
        {result.executionTime !== undefined &&
          result.executionTime !== null && (
            <span className="text-xs text-slate-500 tabular-nums">
              • Execution time:{" "}
              {typeof result.executionTime === "number"
                ? `${result.executionTime} ms`
                : result.executionTime}
            </span>
          )}
        {result.memoryKb !== undefined &&
          result.memoryKb !== null &&
          result.memoryKb > 0 && (
            <span className="text-xs text-slate-500 tabular-nums">
              • Memory: {result.memoryKb} KB
            </span>
          )}
      </div>

      <div className="flex items-center gap-2">
        {isEvaluating && casesCount > 1 && (
          <button
            type="button"
            onClick={onSkipAnimation}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-slate-100"
          >
            <Zap className="h-3 w-3" aria-hidden="true" />
            <span>Skip Animation</span>
          </button>
        )}
        {result.language && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}
          >
            {result.language}
          </span>
        )}
      </div>
    </div>
  );
}

export default ExecutionResultBanner;
