import { AlertTriangle, ClipboardList, RotateCcw } from "lucide-react";

/**
 * EmptyAssessment displays a fallback banner when no questions are available
 * or when a network / timeout error occurs fetching questions from the backend.
 * Features vector icons and an optional "Try again" action button.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.title="No questions available"] - Primary heading text
 * @param {string} [props.message="No questions are available for this assessment."] - Detailed explanatory message
 * @param {Error|null} [props.error=null] - Error object if failure occurred during polling/fetching
 * @param {Function|null} [props.onRetry=null] - Callback triggered when clicking the "Try again" button
 * @returns {JSX.Element} The rendered empty or error state card
 */
function EmptyAssessment({
  title = "No questions available",
  message = "No questions are available for this assessment.",
  error = null,
  onRetry = null,
}) {
  const displayTitle = error
    ? "Unable to load assessment questions"
    : title;
  const displayMessage = error
    ? error.message || "Failed to connect to backend server. Please check your network or try again."
    : message;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            error
              ? "bg-amber-50 text-amber-600 border border-amber-200"
              : "bg-slate-100 text-slate-500"
          }`}
          aria-hidden="true"
        >
          {error ? (
            <AlertTriangle className="h-7 w-7" />
          ) : (
            <ClipboardList className="h-7 w-7" />
          )}
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">{displayTitle}</h2>
        <p className="mt-2 text-slate-600">{displayMessage}</p>

        {onRetry && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Try again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyAssessment;
