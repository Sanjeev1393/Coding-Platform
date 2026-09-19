import { memo } from "react";
import { Timer } from "lucide-react";

/**
 * AssessmentHeader displays the assessment banner with title, dynamic countdown timer,
 * urgency highlights, and the global "Finish Assessment" trigger.
 *
 * @param {Object} props
 * @param {string} [props.testName="DSA Coding Assessment"] - Name of the test/assessment
 * @param {string} props.formattedTime - Pre-formatted mm:ss countdown display
 * @param {boolean} [props.isUrgent=false] - True when remaining time is below threshold (5 mins)
 * @param {boolean} [props.isTimeUp=false] - True when remaining time reaches 00:00
 * @param {Function} [props.onFinishAssessment] - Handler to open the assessment confirmation dialog
 * @param {boolean} [props.isLocked=false] - True when assessment is submitted or expired
 * @returns {JSX.Element} The rendered header
 */
function AssessmentHeader({
  testName = "DSA Coding Assessment",
  formattedTime,
  isUrgent = false,
  isTimeUp = false,
  onFinishAssessment,
  isLocked = false,
}) {
  const timerStyle = isTimeUp
    ? "bg-red-50 text-red-700 border-red-300"
    : isUrgent
      ? "bg-amber-50 text-amber-700 border-amber-300"
      : "bg-blue-50 text-blue-700 border-transparent";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
      <div>
        <h1 className="text-2xl font-bold">Coding Assessment</h1>
        <p className="mt-1 text-slate-500">{testName}</p>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 items-center gap-2 rounded-md border px-3.5 text-base font-semibold tabular-nums transition-colors duration-300 ${timerStyle}`}
          aria-label="Assessment countdown timer"
        >
          <Timer className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formattedTime}</span>
        </div>

        {onFinishAssessment && (
          <button
            type="button"
            onClick={onFinishAssessment}
            disabled={isLocked}
            className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-rose-300 bg-rose-50/50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover:border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Finish Assessment
          </button>
        )}
      </div>
    </header>
  );
}

export default memo(AssessmentHeader);
