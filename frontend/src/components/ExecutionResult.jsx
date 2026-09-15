function ExecutionResult({
  result,
  isRunning = false,
  languageName,
  questionNumber,
  className = "",
}) {
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
        <svg
          className="h-5 w-5 animate-spin text-blue-600"
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
    return (
      <div
        role="region"
        aria-label="Execution result"
        className={`${className || "mt-4"} rounded-md border border-red-200 bg-red-50 p-4 text-red-800`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-red-700">✗ Error</span>
          {result.language && (
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              {result.language}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs font-medium uppercase tracking-wider text-red-600">
          Error details
        </p>
        <pre className="mt-1 max-h-[160px] overflow-y-auto rounded-md bg-white p-3 font-mono text-sm text-red-700 border border-red-100 whitespace-pre-wrap">
          {result.error || "An unexpected error occurred during execution."}
        </pre>
      </div>
    );
  }

  // status === "success"
  return (
    <div
      role="region"
      aria-label="Execution result"
      className={`${className || "mt-4"} rounded-md border border-green-200 bg-green-50 p-4 text-slate-800`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-green-700">
            ✓ Success
          </span>
          {result.executionTime && (
            <span className="text-xs text-slate-500">
              • Execution time: {result.executionTime}
            </span>
          )}
        </div>
        {result.language && (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            {result.language}
          </span>
        )}
      </div>

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

      <p className="mt-3 text-xs text-slate-400">
        ⚠ Mock result — compiler not connected yet
      </p>
    </div>
  );
}

export default ExecutionResult;
