import StatusBanner from "./StatusBanner";

function OutputPanel({
  result,
  error,
  isRunning = false,
  languageName,
  questionNumber,
}) {
  if (isRunning) {
    const runningMessage = languageName && questionNumber
      ? `Running Question ${questionNumber} using ${languageName}…`
      : languageName
        ? `Running test cases using ${languageName}…`
        : "Running test cases against your solution.";

    return (
      <StatusBanner
        variant="info"
        title="Executing code…"
        message={runningMessage}
      />
    );
  }

  if (error) {
    return (
      <StatusBanner
        variant="error"
        title="Validation error"
        message={error}
      />
    );
  }

  if (!result) return null;

  return (
    <div
      role="region"
      aria-label="Execution result"
      className="mt-4 rounded-md border border-green-200 bg-green-50 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-green-700">
          ✓ {result.status} — {result.testCases} test cases passed
        </p>
        {result.language && (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            {result.language}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-600">Output</p>
      <pre className="mt-1 rounded-md bg-white px-3 py-2 font-mono text-sm text-slate-800">
        {result.output}
      </pre>
      <p className="mt-3 text-xs text-slate-400">
        ⚠ Mock result — compiler not connected yet
      </p>
    </div>
  );
}

export default OutputPanel;
